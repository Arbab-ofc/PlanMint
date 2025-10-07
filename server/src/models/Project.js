
import mongoose from 'mongoose';
import User from './User.js';
const { Schema } = mongoose;

const MEMBER_ROLES = ['owner', 'admin', 'member'];

const MemberSchema = new Schema(
  {
    username: { type: String, required: true, lowercase: true, trim: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' }, 
    role: { type: String, enum: MEMBER_ROLES, default: 'member' },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', default: undefined },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, default: '', maxlength: 5000 },

    members: { type: [MemberSchema], default: [] },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: undefined },

    startDate: { type: Date, default: undefined },
    endDate: { type: Date, default: undefined },
    archivedAt: { type: Date, default: undefined },
    projectStatus: {
       type: String,
       enum: ['pending', 'done', 'failed'],
       default: 'pending',
       index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);


ProjectSchema.index({ 'members.user': 1 });
ProjectSchema.index({ 'members.username': 1 });
ProjectSchema.index({ name: 'text', description: 'text' });


ProjectSchema.pre('validate', async function (next) {
  try {
    
    if (typeof this.name === 'string') this.name = this.name.trim();
    if (typeof this.description === 'string') this.description = this.description.trim();

    
    const seen = new Set();
    this.members = this.members.filter((m) => {
      const key = (m.username || '').toLowerCase().trim();
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      m.username = key;
      return true;
    });

    
    const needLookup = this.members.filter((m) => m.username && !m.user);
    if (needLookup.length) {
      const usernames = [...new Set(needLookup.map((m) => m.username))];
      const users = await User.find({ username: { $in: usernames } }, { _id: 1, username: 1 }).lean();
      const map = new Map(users.map((u) => [u.username, u._id]));
      for (const m of this.members) {
        if (m.username && !m.user) {
          const id = map.get(m.username);
          if (!id) return next(new Error(`User not found for username "${m.username}"`));
          m.user = id;
        }
      }
    }

    
    if (this.createdBy) {
      const creator = await User.findById(this.createdBy).select('username').lean();
      if (!creator) return next(new Error('createdBy user not found'));
      const creatorUsername = (creator.username || '').toLowerCase().trim();

      let idx = this.members.findIndex(
        (m) =>
          (m.user && String(m.user) === String(this.createdBy)) ||
          (m.username && m.username === creatorUsername)
      );

      if (idx === -1) {
        this.members.push({
          user: this.createdBy,
          username: creatorUsername,
          role: 'owner',
          addedBy: this.createdBy,
        });
      } else {
        this.members[idx].role = 'owner';
        if (!this.members[idx].user) this.members[idx].user = this.createdBy;
        if (!this.members[idx].username) this.members[idx].username = creatorUsername;
      }

      
      const ownerIdxs = this.members
        .map((m, i) => (m.role === 'owner' ? i : -1))
        .filter((i) => i !== -1);

      for (const i of ownerIdxs) {
        if (String(this.members[i].user) !== String(this.createdBy)) {
          this.members[i].role = 'admin';
        }
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});


ProjectSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() || {};
  const $set = update.$set || update;
  if ($set.name && typeof $set.name === 'string') $set.name = $set.name.trim();
  if ($set.description && typeof $set.description === 'string') $set.description = $set.description.trim();
  if (update.$set) update.$set = $set;
  else this.setUpdate($set);
});

export default mongoose.model('Project', ProjectSchema);
