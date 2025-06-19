import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  studentId: mongoose.Types.ObjectId;
  submissionId: number;
  problemId: string;
  problemIndex: string;
  problemName: string;
  problemRating: number;
  verdict: string;
  submissionTime: Date;
  solved: boolean;
  tags: string[];
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
    },
    problemId: {
      type: String,
      required: true,
    },
    problemIndex: {
      type: String,
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
    tags: {
      type: [String],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

SubmissionSchema.index({ studentId: 1, submissionTime: -1 });
SubmissionSchema.index({ studentId: 1, submissionId: 1 }, { unique: true });
SubmissionSchema.index({ studentId: 1, tags: 1 });
SubmissionSchema.index({ studentId: 1, problemId: 1 });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);