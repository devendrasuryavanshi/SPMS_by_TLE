import mongoose, { Schema, Document } from 'mongoose';

export interface IProblem extends Document {
  problemId: string;
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];
}

const ProblemSchema: Schema = new Schema({
  problemId: { type: String, required: true, unique: true },
  contestId: { type: Number, required: true },
  index: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  tags: { type: [String], default: [] },
});


ProblemSchema.index({ tags: 1 });
ProblemSchema.index({ rating: 1 });
ProblemSchema.index({ problemId: 1 });

// A compound index to optimize the main query
ProblemSchema.index({ tags: 1, rating: 1 });

export default mongoose.model<IProblem>('Problem', ProblemSchema);