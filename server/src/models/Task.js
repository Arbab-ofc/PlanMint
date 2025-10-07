
import mongoose from 'mongoose';
import User from './User.js';
import Project from './Project.js';
const { Schema } = mongoose;

const STATUSES = ['Todo', 'In-Progress', 'Done'];
const PRIORITIES = ['low', 'medium', 'high'];

const TaskSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true, maxlength: 20000 },

    assigneeUsername: { type: String, lowercase: true, trim: true, default: undefined, index: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', default: undefined, index: true },

    status: { type: String, enum: STATUSES, default: 'Todo', index: true },
    priority: { type: String, enum: PRIORITIES, default: 'medium', index: true },
    dueDate: { type: Date, default: undefined, index: true },

    projectStatus: {
       type: String,
       enum: ['pending', 'done', 'failed'],
       default: 'pending',
       index: true,
    },

    labels: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.from(
          new Set(
            (arr || [])
              .filter((v) => typeof v === 'string')
              .map((v) => v.trim().toLowerCase())
              .filter(Boolean)
          )
        ),
    },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: undefined },
    lastStatusChangedAt: { type: Date, default: undefined },

    statusHistory: {
      type: [
        {
          from: { type: String, enum: STATUSES, default: undefined },
          to: { type: String, enum: STATUSES, required: true },
          at: { type: Date, required: true },
          by: { type: Schema.Types.ObjectId, ref: 'User', default: undefined },
        },
      ],
      default: undefined,
      _id: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

TaskSchema.index({ title: 'text', description: 'text' });
TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ projectId: 1, priority: 1 });
TaskSchema.index({ projectId: 1, assigneeId: 1, status: 1 });

TaskSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() || {};
  const $set = update.$set || update;

  if ($set.title && typeof $set.title === 'string') $set.title = $set.title.trim();
  if ($set.description && typeof $set.description === 'string') $set.description = $set.description.trim();

  if (Array.isArray($set.labels)) {
    $set.labels = Array.from(
      new Set(
        $set.labels
          .filter((v) => typeof v === 'string')
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean)
      )
    );
  }

  if (typeof $set.status === 'string') {
    $set.lastStatusChangedAt = new Date();

    if ($set._prevStatus && $set._prevStatus !== $set.status) {
      const entry = {
        from: $set._prevStatus,
        to: $set.status,
        at: new Date(),
      };
      if ($set.updatedBy) entry.by = $set.updatedBy;

      const $push = update.$push || {};
      $push.statusHistory = $push.statusHistory || { $each: [] };
      $push.statusHistory.$each.push(entry);
      update.$push = $push;

      delete $set._prevStatus;
    }
  }

  if (update.$set) update.$set = $set;
  else this.setUpdate($set);
});

TaskSchema.pre('validate', async function (next) {
  try {
    if (this.assigneeUsername) {
      this.assigneeUsername = this.assigneeUsername.toLowerCase().trim();
    }

    if (this.assigneeUsername && !this.assigneeId) {
      const u = await User.findOne({ username: this.assigneeUsername }, { _id: 1 }).lean();
      if (!u) return next(new Error(`Assignee not found: "${this.assigneeUsername}"`));
      this.assigneeId = u._id;
    }

    if (this.assigneeId && this.projectId) {
      const project = await Project.findById(this.projectId, { members: 1 }).lean();
      if (!project) return next(new Error('Project not found for given projectId'));
      const isMember = (project.members || []).some(
        (m) => String(m.user || m.userId) === String(this.assigneeId)
      );
      if (!isMember) return next(new Error('Assignee is not a member of this project'));
    }

    if (this.isNew && this.status && !this.lastStatusChangedAt) {
      this.lastStatusChangedAt = this.createdAt || new Date();
    }

    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('Task', TaskSchema);
