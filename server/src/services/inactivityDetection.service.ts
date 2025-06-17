import mongoose from 'mongoose';
import Student, { IStudent } from '../models/student.model';
import EmailService from './email.service';
import logger from '../utils/logger.utils';

interface InactiveStudent {
  student: IStudent;
  daysSinceLastSubmission: number;
  lastSubmissionDate?: Date;
}

class InactivityDetectionService {
  private emailService: EmailService;
  private readonly INACTIVITY_THRESHOLD_DAYS = 7;

  constructor() {
    this.emailService = new EmailService();
  }

  async checkAndNotifyInactiveStudents(studentId?: mongoose.Types.ObjectId): Promise<{
    totalChecked: number;
    inactiveCount: number;
    emailsSent: number;
    emailsFailed: number;
  }> {
    try {
      const query = studentId ? { _id: studentId } : {};
      const students = await Student.find({
        ...query,
        autoEmailEnabled: true,
        codeforcesHandle: { $exists: true, $ne: '' }
      });

      const inactiveStudents: InactiveStudent[] = [];

      for (const student of students) {
        const inactivityData = await this.checkStudentInactivity(student);
        if (inactivityData) {
          inactiveStudents.push(inactivityData);
        }
      }

      // emails to inactive students
      let emailsSent = 0;
      let emailsFailed = 0;

      for (const inactiveData of inactiveStudents) {
        const emailSent = await this.sendInactivityEmail(inactiveData);
        if (emailSent) {
          emailsSent++;
          await Student.findByIdAndUpdate(inactiveData.student._id, {
            $inc: { inactivityEmailCount: 1 },
            $set: { lastInactivityEmailSent: new Date() }
          });
        } else {
          emailsFailed++;
        }
      }

      logger.info(`Inactivity check completed. Emails sent: ${emailsSent}, Failed: ${emailsFailed}`);

      return {
        totalChecked: students.length,
        inactiveCount: inactiveStudents.length,
        emailsSent,
        emailsFailed
      };
    } catch (error) {
      logger.error('Error in inactivity detection:', error);
      throw error;
    }
  }

  private async checkStudentInactivity(student: IStudent): Promise<InactiveStudent | null> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.INACTIVITY_THRESHOLD_DAYS);

      if (!student.lastSubmissionTime) {
        return {
          student,
          daysSinceLastSubmission: this.INACTIVITY_THRESHOLD_DAYS + 1,
          lastSubmissionDate: undefined
        };
      }

      if (student.lastSubmissionTime < cutoffDate) {
        const daysDiff = Math.floor(
          (Date.now() - (student?.lastSubmissionTime?.getTime() || 0)) / (1000 * 60 * 60 * 24)
        );

        return {
          student,
          daysSinceLastSubmission: daysDiff,
          lastSubmissionDate: student.lastSubmissionTime
        };
      }

      return null; // student is active
    } catch (error) {
      logger.error(`Error checking inactivity for student ${student._id}:`, error);
      return null;
    }
  }

  private async sendInactivityEmail(inactiveData: InactiveStudent): Promise<boolean> {
    try {
      const { student, daysSinceLastSubmission, lastSubmissionDate } = inactiveData;

      // if we've sent an email recently
      const lastEmailSent = student.lastInactivityEmailSent;
      if (lastEmailSent) {
        const daysSinceLastEmail = Math.floor(
          (Date.now() - lastEmailSent.getTime()) / (1000 * 60 * 60 * 24)
        );

        // if we sent one in the last 3 days
        if (daysSinceLastEmail < 3) {
          logger.info(`Skipping email for ${student.name} - last email sent ${daysSinceLastEmail} days ago`);
          return false;
        }
      }

      const emailData = {
        studentName: student.name,
        studentEmail: student.email,
        codeforcesHandle: student.codeforcesHandle,
        daysSinceLastSubmission,
        lastSubmissionDate,
        currentRating: student.rating
      };

      return await this.emailService.sendInactivityReminder(emailData);
    } catch (error) {
      logger.error(`Error sending inactivity email for student ${inactiveData.student._id}:`, error);
      return false;
    }
  }
}

export default InactivityDetectionService;
