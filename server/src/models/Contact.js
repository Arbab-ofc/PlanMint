
import mongoose from 'mongoose';
const { Schema } = mongoose;

const TAGS = [
  'client',
  'stakeholder',
  'vendor',
  'partner',
  'lead',
  'prospect',
  'investor',
  'supplier',
  'other',
];

const ContactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      default: undefined,
    },
    phone: { type: String, trim: true, default: undefined, maxlength: 30 },

    tags: {
      type: [
        {
          type: String,
          enum: TAGS,
          lowercase: true,
          trim: true,
        },
      ],
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
    notes: { type: String, trim: true, default: undefined, maxlength: 10000 },

    projects: [{ type: Schema.Types.ObjectId, ref: 'Project', index: true }],
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    archivedAt: { type: Date, default: undefined },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: undefined },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ContactSchema.index({ name: 'text' });
ContactSchema.index(
  { ownerId: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);
ContactSchema.index(
  { ownerId: 1, phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: 'string' } } }
);
ContactSchema.index({ tags: 1 });

ContactSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() || {};
  const $set = update.$set || update;

  if ($set.name && typeof $set.name === 'string') $set.name = $set.name.trim();
  if ($set.email && typeof $set.email === 'string') $set.email = $set.email.toLowerCase().trim();
  if ($set.phone && typeof $set.phone === 'string') $set.phone = $set.phone.trim();

  if (Array.isArray($set.tags)) {
    $set.tags = Array.from(
      new Set(
        $set.tags
          .filter((v) => typeof v === 'string')
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean)
      )
    );
  }

  if (update.$set) update.$set = $set;
  else this.setUpdate($set);
});

export default mongoose.model('Contact', ContactSchema);
