import mongoose, { Document, Schema } from 'mongoose';

interface ISubmission extends Document {
  studentId: mongoose.Types.ObjectId;
  submissionId: number;
  problemId: number;
  problemName: string;
  problemRating: number;
  verdict: string;
  submissionTime: Date;
  solved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    submissionId: {
      type: Number,
      required: true,
      unique: true,
    },
    problemId: {
      type: Number,
      required: true,
    },
    problemName: {
      type: String,
      required: true,
    },
    problemRating: {
      type: Number,
      required: true,
    },
    verdict: {
      type: String,
      required: true,
    },
    submissionTime: {
      type: Date,
      required: true,
    },
    solved: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);