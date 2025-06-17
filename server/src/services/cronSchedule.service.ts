import * as cron from 'node-cron';
import logger from '../utils/logger.utils';
import SystemSetting, { ISystemSetting } from '../models/systemSetting.model';
import Student, { IStudent } from '../models/student.model';
import CodeforcesProfileSyncService from './codeforcesSync.service';
import mongoose from 'mongoose';

class CronScheduler {
  private static currentTask: cron.ScheduledTask | null = null;

  static async initializeScheduler() {
    logger.info('Initializing cron scheduler');
    await this.setupCronJob();
  }

  static async setupCronJob() {
    try {
      // Stop existing cron job if running
      if (this.currentTask) {
        this.currentTask.stop();
        this.currentTask.destroy();
        logger.info('Stopped existing cron job');
      }

      const cronSchedule: ISystemSetting | null = await SystemSetting.findOne({});
      if (!cronSchedule) {
        logger.warn('Cron schedule not found in database. Creating default settings.');
        return;
      }

      const studentIds = (await Student.distinct('_id')) as mongoose.Types.ObjectId[];
      if (studentIds.length === 0) {
        logger.info('No students found in database. Cron job created but will skip execution.');
      }

      // validate cron expression
      if (!cron.validate(cronSchedule.cronSchedule)) {
        logger.error(`Invalid cron expression: ${cronSchedule.cronSchedule}`);
        return;
      }

      // new cron job
      this.currentTask = cron.schedule(cronSchedule.cronSchedule, async () => {
        logger.info(`🕐 Running scheduled profile sync at ${new Date().toISOString()}`);
        logger.info(`📅 Schedule: ${cronSchedule.scheduleInput} (${cronSchedule.cronSchedule})`);

        try {
          const currentStudentIds = (await Student.distinct('_id')) as mongoose.Types.ObjectId[];

          if (currentStudentIds.length === 0) {
            logger.info('No students found. Skipping sync.');
            return;
          }

          const result = await CodeforcesProfileSyncService.syncAllProfiles(currentStudentIds);

          logger.info(`✅ Scheduled sync completed successfully:`);
          logger.info(`   📊 Total: ${result.totalStudents}, Success: ${result.successCount}, Errors: ${result.errorCount}`);

          if (result.emailStats) {
            logger.info(`   📧 Emails: ${result.emailStats.emailsSent} sent, ${result.emailStats.emailsFailed} failed, ${result.emailStats.inactiveCount} inactive students`);
          }

        } catch (error) {
          logger.error('❌ Error in scheduled profile sync:', error);
        }
      }, {
        timezone: process.env.TZ || 'UTC'
      });

      logger.info(`✅ Cron job scheduled successfully:`);
      logger.info(`   📅 Schedule: ${cronSchedule.scheduleInput}`);
      logger.info(`   🔧 Cron Expression: ${cronSchedule.cronSchedule}`);
      logger.info(`   👥 Students to sync: ${studentIds.length}`);
      logger.info(`   🌍 Timezone: ${process.env.TZ || 'UTC'}`);

    } catch (error) {
      logger.error('❌ Error setting up cron job:', error);
    }
  }

  // Method to update cron schedule dynamically
  static async updateSchedule() {
    logger.info('🔄 Updating cron schedule...');
    await this.setupCronJob();
  }

  static stopScheduler() {
    if (this.currentTask) {
      this.currentTask.stop();
      this.currentTask.destroy();
      this.currentTask = null;
      logger.info('🛑 Cron scheduler stopped');
    }
  }
}

export default CronScheduler;
