import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSetting extends Document {
  cronSchedule: string;
  scheduleInput: string;
  isAutoSyncEnabled: boolean;
  lastSyncDate: Date;
  lastUpdatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const SystemSettingSchema: Schema = new Schema({
  cronSchedule: {
    type: String,
    required: true,
    default: '0 2 * * *',
  },
  scheduleInput: {
    type: String,
    required: true,
    default: 'Every day at 2 AM',
  },
  isAutoSyncEnabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  lastSyncDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);