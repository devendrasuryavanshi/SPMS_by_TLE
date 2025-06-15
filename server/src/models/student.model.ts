import mongoose, { Document, Schema } from 'mongoose';

interface IStudent extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  codeforcesHandle: string;
  currentRating: number;
  maxRating: number;
  lastDataSync: Date;
  inactivityEmailCount: number;
  autoEmailEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
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
    phoneNumber: {
      type: String,
      required: true,
    },
    codeforcesHandle: {
      type: String,
      required: true,
    },
    currentRating: {
      type: Number,
    },
    maxRating: {
      type: Number,
    },
    lastDataSync: {
      type: Date,
      required: true,
      default: Date.now,
    },
    inactivityEmailCount: {
      type: Number,
      required: true,
      default: 0,
    },
    autoEmailEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStudent>('Student', StudentSchema);