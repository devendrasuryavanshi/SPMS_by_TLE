import mongoose, { Document, Schema } from 'mongoose';

interface ISystemSetting extends Document {
  cronSchedule: string;
  cronFrequency: number;
  lastUpdatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const SystemSettingSchema: Schema = new Schema({
  cronSchedule: {
    type: String,
    required: true,
  },
  cronFrequency: {
    type: Number,
    required: true,
  },
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);