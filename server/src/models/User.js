import mongoose from 'mongoose';
const { Schema } = mongoose;

const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9_]{1,18}[a-z0-9])?$/;

const UserSchema = new Schema(
  {
    
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: USERNAME_REGEX,
    },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    },
    role: { type: String, enum: ['admin', 'member'], default: 'member', index: true },

    
    passwordHash: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    verificationOTP: { type: String, default: undefined },
    verificationOTPExpiresAt: { type: Date, default: undefined },
    resetToken: { type: String, default: undefined },          
    resetTokenExpiresAt: { type: Date, default: undefined },

    
    avatarUrl: { type: String, default: undefined },
    timezone: { type: String, default: 'Asia/Kolkata' },
    locale: { type: String, default: 'en-IN' },

    
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: undefined },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: undefined },
  },
  {
    timestamps: true,              
    versionKey: false,             
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.resetToken;
        delete ret.resetTokenExpiresAt;
        return ret;
      },
    },
  }
);


UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });


UserSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() || {};
  const $set = update.$set || update;
  if ($set.email && typeof $set.email === 'string') $set.email = $set.email.toLowerCase().trim();
  if ($set.username && typeof $set.username === 'string') $set.username = $set.username.toLowerCase().trim();
  if (update.$set) update.$set = $set;
  else this.setUpdate($set);
});

export default mongoose.model('User', UserSchema);
