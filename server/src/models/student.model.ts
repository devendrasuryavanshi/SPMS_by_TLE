import mongoose, { Document, Schema } from 'mongoose';
import ContestHistory from './contestHistory.model';
import Submission from './submission.model';
import RecommendedProblem from './recommendedProblem.model';

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
  lastSubmissionTime?: Date;
  lastContestTime: Date;
  lastDataSync: Date;
  syncStatus: string;
  lastInactivityEmailSent?: Date;
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
    },
    lastContestTime: {
      type: Date,
      required: false,
    },
    lastDataSync: {
      type: Date,
      required: true,
      default: Date.now
    },
    syncStatus: {
      type: String,
    },
    lastInactivityEmailSent: {
      type: Date,
      required: false
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

StudentSchema.pre('findOneAndDelete', async function (next) {
  const student: any = await this.model.findOne(this.getFilter());

  if (!student) return next();

  const studentId = student._id;

  // Delete dependent documents
  await Promise.all([
    ContestHistory.deleteMany({ studentId }),
    Submission.deleteMany({ studentId }),
    RecommendedProblem.deleteMany({ studentId }),
  ]);

  next();
});

export default mongoose.model<IStudent>('Student', StudentSchema);