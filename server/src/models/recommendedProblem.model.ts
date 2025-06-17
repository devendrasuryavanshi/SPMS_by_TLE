import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendedProblem extends Document {
  studentId: mongoose.Types.ObjectId;
  problems: {
    problemId: string;
    problemName: string;
    problemIndex: string;
    problemRating: number;
    tags: string[];
  }
  createdAt: Date;
  updatedAt: Date;
}

const RecommendedProblemSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    problems: [
      {
        problemId: {
          type: String,
          required: true,
        },
        problemName: {
          type: String,
          required: true,
        },
        problemIndex: {
          type: String,
          required: true,
        },
        problemRating: {
          type: Number,
          required: true,
        },
        tags: {
          type: [String],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IRecommendedProblem>('RecommendedProblem', RecommendedProblemSchema);