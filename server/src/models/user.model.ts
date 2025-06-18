import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
  adminConfig: {
    hasEditAccess: boolean;
    hasDeleteAccess: boolean;
    hasCritialAccess: boolean;
  }
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'student'],
      default: 'student',
    },
    adminConfig: {
      hasEditAccess: {
        type: Boolean,
        default: false,
      },
      hasDeleteAccess: {
        type: Boolean,
        default: false,
      },
      hasCritialAccess: {
        type: Boolean,
        default: false,
      },
    }
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    return next(error);
  }
});


UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
}

export default mongoose.model<IUser>('User', UserSchema);