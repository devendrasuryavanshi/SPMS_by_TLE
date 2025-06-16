import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  avatarUrl: string;
  email: string;
  phoneNumber: string;
  codeforcesHandle: string;
  rating: number;
  maxRating: number;
  rank: string;
  country: string;
  lastSubmissionTime: Date;
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
      required: true
    },
    avatarUrl: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    codeforcesHandle: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true
    },
    maxRating: {
      type: Number,
      required: true
    },
    rank: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    lastSubmissionTime: {
      type: Date,
      required: true
    },
    lastDataSync: {
      type: Date,
      required: true,
      default: Date.now
    },
    inactivityEmailCount: {
      type: Number,
      required: true
    },
    autoEmailEnabled: {
      type: Boolean,
      required: true
    },
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>('Student', StudentSchema);