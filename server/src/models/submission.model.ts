import mongoose, { Document, Schema } from 'mongoose';

// {
//   "_id": ObjectId,          // Unique identifier for the submission entry
//   "studentId": ObjectId,    // Reference to the Student collection (Indexed)
//   "submissionId": "Number", // Codeforces submission ID (Unique within studentId)
//   "problemId": "Number",    // Codeforces problem ID
//   "problemName": "String",  // Name of the problem
//   "problemRating": "Number",// Difficulty rating of the problem
//   "verdict": "String",      // Submission verdict (e.g., "OK", "WRONG_ANSWER")
//   "submissionTime": "Date", // Timestamp of the submission (Indexed for filtering)
//   "solved": "Boolean",      // True if verdict is "OK", false otherwise (Indexed for solved problem counts)
//   "createdAt": "Date",      // Timestamp of record creation
//   "updatedAt": "Date"       // Timestamp of last update to this record
// }

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