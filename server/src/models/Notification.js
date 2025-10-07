
import mongoose from 'mongoose';
const { Schema } = mongoose;

const NOTIF_TYPES = [
  'task_assigned',
  'task_status_changed',
  'task_due_soon',
  'task_overdue',
  'comment_added',
  'project_member_added',
  'project_role_changed',
];

const ENTITY_TYPES = ['task', 'project', 'contact'];

const RefSchema = new Schema(
  {
    entityType: { type: String, enum: ENTITY_TYPES, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: undefined },
  },
  { _id: false }
);

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIF_TYPES, required: true, index: true },

    ref: { type: RefSchema, required: true },

    message: { type: String, trim: true, default: undefined, maxlength: 500 },

    meta: { type: Schema.Types.Mixed, default: undefined }, 

    readAt: { type: Date, default: undefined, index: true },

    deliverAt: { type: Date, default: undefined, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, readAt: 1 });

NotificationSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() || {};
  const $set = update.$set || update;
  if ($set.message && typeof $set.message === 'string') $set.message = $set.message.trim();
  if (update.$set) update.$set = $set;
  else this.setUpdate($set);
});

export default mongoose.model('Notification', NotificationSchema);
