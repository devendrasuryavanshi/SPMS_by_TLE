import mongoose, { Document, Schema } from 'mongoose';

interface IContestHistory extends Document {
  studentId: mongoose.Types.ObjectId;
  contestId: number;
  contestName: string;
  ratingChange: number;
  oldRating: number;
  newRating: number;
  rank: number;
  contestTime: Date;
  problemsUnsolvedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContestHistorySchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    contestId: {
      type: Number,
      required: true,
    },
    contestName: {
      type: String,
      required: true,
    },
    ratingChange: {
      type: Number,
      required: true,
    },
    oldRating: {
      type: Number,
      required: true,
    },
    newRating: {
      type: Number,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    contestTime: {
      type: Date,
      required: true,
    },
    problemsUnsolvedCount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IContestHistory>('ContestHistory', ContestHistorySchema);