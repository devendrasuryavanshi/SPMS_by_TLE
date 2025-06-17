import nodemailer from 'nodemailer';
import logger from '../utils/logger.utils';
import dotenv from 'dotenv';

dotenv.config();

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface InactivityEmailData {
  studentName: string;
  studentEmail: string;
  codeforcesHandle: string;
  daysSinceLastSubmission: number;
  lastSubmissionDate?: Date;
  currentRating?: number;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  private async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }

  async sendInactivityReminder(data: InactivityEmailData): Promise<boolean> {
    try {
      const isConnected = await this.verifyConnection();
      if (!isConnected) {
        throw new Error('Email service not available');
      }

      const emailHtml = this.generateInactivityEmailHtml(data);
      const emailText = this.generateInactivityEmailText(data);

      const mailOptions = {
        from: {
          name: 'SPMS - Student Progress Management System',
          address: process.env.SMTP_USER || 'noreply@spms.com'
        },
        to: data.studentEmail,
        subject: '🎯 Time to Get Back to Coding - Your Progress Awaits!',
        html: emailHtml,
        text: emailText,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Inactivity reminder sent to ${data.studentEmail} (${data.studentName})`);
      return true;
    } catch (error) {
      logger.error(`Failed to send inactivity reminder to ${data.studentEmail}:`, error);
      return false;
    }
  }

  private generateInactivityEmailHtml(data: InactivityEmailData): string {
    const lastSubmissionText = data.lastSubmissionDate
      ? `${data.lastSubmissionDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`
      : 'No recent submissions found';

    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Coding Reminder</title>
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
              font-family: system-ui, -apple-system, sans-serif; 
              line-height: 1.6; 
              color: #213547; 
              background-color: #f8fafc; 
              padding: 20px; 
          }
          .container { 
              max-width: 500px; 
              margin: 0 auto; 
              background: #ffffff; 
              border-radius: 8px; 
              overflow: hidden; 
              border: 1px solid #e2e8f0; 
          }
          .header { 
              background: #646cff; 
              color: white; 
              padding: 24px 20px; 
              text-align: center; 
          }
          .header h1 { 
              font-size: 20px; 
              font-weight: 600; 
              margin-bottom: 4px; 
          }
          .header p { 
              font-size: 13px; 
              opacity: 0.9; 
          }
          .content { 
              padding: 24px 20px; 
          }
          .greeting { 
              font-size: 16px; 
              font-weight: 500; 
              margin-bottom: 16px; 
          }
          .message { 
              color: #4a5568; 
              margin-bottom: 20px; 
              font-size: 14px; 
          }
          .info-box { 
              background: #f9f9f9; 
              border-left: 3px solid #646cff; 
              padding: 16px; 
              margin: 20px 0; 
              border-radius: 4px; 
          }
          .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 8px; 
              font-size: 14px; 
          }
          .info-row:last-child { 
              margin-bottom: 0; 
          }
          .info-label { 
              color: #718096; 
          }
          .info-value { 
              font-weight: 500; 
              color: #213547; 
          }
          .cta-button { 
              display: inline-block; 
              background: #646cff; 
              color: #ffffff !important; 
              text-decoration: none !important; 
              padding: 10px 20px; 
              border-radius: 6px; 
              font-weight: 500; 
              font-size: 14px; 
              margin: 16px 0; 
              border: none;
              font-family: inherit;
          }
          a.cta-button {
              color: #ffffff !important;
          }
          a.cta-button:visited {
              color: #ffffff !important;
          }
          a.cta-button:hover {
              color: #ffffff !important;
              background: #535bf2 !important;
          }

          .tips { 
              background: #f8fafc; 
              padding: 16px; 
              border-radius: 6px; 
              margin: 16px 0; 
          }
          .tips h4 { 
              color: #213547; 
              font-size: 14px; 
              margin-bottom: 8px; 
          }
          .tips ul { 
              color: #4a5568; 
              font-size: 13px; 
              padding-left: 16px; 
          }
          .tips li { 
              margin-bottom: 4px; 
          }
          .footer { 
              background: #f8fafc; 
              padding: 16px 20px; 
              text-align: center; 
              border-top: 1px solid #e2e8f0; 
          }
          .footer p { 
              color: #718096; 
              font-size: 12px; 
              margin-bottom: 4px; 
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>SPMS</h1>
              <p>Student Progress Management</p>
          </div>
          
          <div class="content">
              <div class="greeting">Hi ${data.studentName},</div>
              
              <div class="message">
                  We noticed it's been <strong>${data.daysSinceLastSubmission} days</strong> since your last coding submission. Time to get back on track!
              </div>
              
              <div class="info-box">
                  <div class="info-row">
                      <span class="info-label">Handle</span>
                      <span class="info-value">  ${data.codeforcesHandle}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Last Activity</span>
                      <span class="info-value">  ${lastSubmissionText}</span>
                  </div>
                  ${data.currentRating ? `
                  <div class="info-row">
                      <span class="info-label">Current Rating</span>
                      <span class="info-value">  ${data.currentRating}</span>
                  </div>
                  ` : ''}
              </div>
              
              <div style="text-align: center;">
                  <a href="https://codeforces.com/problemset" class="cta-button">
                      Start Solving Problems
                  </a>
              </div>
              
              <div class="tips">
                  <h4>Quick Tips:</h4>
                  <ul>
                      <li>Start with problems slightly below your current rating</li>
                      <li>Focus on understanding concepts, not just solving</li>
                      <li>Review editorial solutions for unsolved problems</li>
                      <li>Participate in contests regularly</li>
                  </ul>
              </div>
          </div>
          
          <div class="footer">
              <p>This is an automated reminder from SPMS</p>
              <p>Keep coding and stay consistent! 💪</p>
          </div>
      </div>
  </body>
  </html>
  `;
  }

  private generateInactivityEmailText(data: InactivityEmailData): string {
    const lastSubmissionText = data.lastSubmissionDate
      ? `${data.lastSubmissionDate.toLocaleDateString()}`
      : 'No recent submissions found';

    return `
Hi ${data.studentName},

We noticed it's been ${data.daysSinceLastSubmission} days since your last coding submission. Time to get back on track!

Your Details:
• Handle: ${data.codeforcesHandle}
• Last Activity: ${lastSubmissionText}
${data.currentRating ? `• Current Rating: ${data.currentRating}` : ''}

Consistent practice is key to improving your problem-solving skills and competitive programming rating.

Start solving problems: https://codeforces.com/problemset

Quick Tips:
• Start with problems slightly below your current rating
• Focus on understanding concepts, not just solving
• Review editorial solutions for unsolved problems
• Participate in contests regularly

This is an automated reminder from SPMS.
Keep coding and stay consistent!

Best regards,
SPMS Team
  `;
  }
}

export default EmailService;