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
  private transporter: nodemailer.Transporter;// nodemailer transporter instance

  constructor() {// initializing nodemailer transporter
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
        // to: data.studentEmail, // 
        to: 'hrithiksuryavanshee@gmail.com', // sending to my email for testing
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

  // email HTML generaation
  private generateInactivityEmailHtml(data: InactivityEmailData): string {
    const lastDate = data.lastSubmissionDate
      ? data.lastSubmissionDate.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
      : 'No recent submissions';

    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>SPMS Reminder</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background: #f8f9fa;
        margin: 0;
        padding: 0;
        color: #212529;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        overflow: hidden;
      }
      .header {
        background: #0b57d0;
        color: #ffffff;
        text-align: center;
        padding: 24px;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
      }
      .content {
        padding: 24px;
      }
      .greeting {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
      }
      .message {
        font-size: 14px;
        line-height: 1.6;
        color: #343a40;
        margin-bottom: 20px;
      }
      .info {
        background: #f1f3f5;
        padding: 16px;
        border-left: 4px solid #0b57d0;
        border-radius: 6px;
        font-size: 14px;
        margin-bottom: 24px;
      }
      .cta {
        text-align: center;
        margin: 32px 0;
      }
      .cta a {
        background: #0b57d0;
        color: #ffffff;
        text-decoration: none;
        padding: 12px 28px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        display: inline-block;
      }
      .cta a:hover {
        background: #0a47b1;
      }
      .tips {
        font-size: 13px;
        color: #495057;
        margin-top: 24px;
        line-height: 1.5;
      }
      .footer {
        background: #f8f9fa;
        border-top: 1px solid #dee2e6;
        padding: 20px 24px;
        text-align: center;
        font-size: 12px;
        color: #868e96;
      }
      .footer a {
        color: #0b57d0;
        text-decoration: none;
        margin: 0 8px;
      }
      .footer a:hover {
        text-decoration: underline;
      }
      .social-icons {
        margin-top: 12px;
      }
      .social-icons a {
        margin: 0 6px;
        display: inline-block;
      }
      .social-icons img {
        width: 20px;
        height: 20px;
        vertical-align: middle;
        opacity: 0.7;
      }
      .social-icons img:hover {
        opacity: 1;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>SPMS — Inactivity Reminder</h1>
      </div>
      <div class="content">
        <div class="greeting">Hello ${data.studentName},</div>
        <div class="message">
          You haven’t submitted a Codeforces problem in the past <strong>${data.daysSinceLastSubmission} days</strong>. Let’s get back on track!
        </div>
        <div class="info">
          <p><strong>Codeforces Handle:</strong> ${data.codeforcesHandle}</p>
          <p><strong>Last Submission:</strong> ${lastDate}</p>
          ${data.currentRating ? `<p><strong>Current Rating:</strong> ${data.currentRating}</p>` : ''}
        </div>
        <div class="cta">
          <a href="https://codeforces.com/problemset" target="_blank">Resume Practice</a>
        </div>
        <div class="tips">
          <strong>Tips for Getting Back:</strong><br>
          • Start with easy problems to warm up<br>
          • Review solutions/editorials<br>
          • Set a simple goal (1-2 problems/day)
        </div>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} SPMS • Student Progress Management System</p>
        <div class="social-icons">
          <a href="https://github.com/devendrasuryavanshi" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733553.png" alt="Github"></a>
          <a href="https://x.com/Devendra_Dood" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter"></a>
          <a href="https://www.linkedin.com/in/devendrasuryavanshi" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn"></a>
          <a href="mailto:devendrasooryavanshee@gmail.com"><img src="https://cdn-icons-png.flaticon.com/512/732/732200.png" alt="Email"></a>
        </div>
        <p>
          <a href="#">Privacy Policy</a> • 
          <a href="#">Terms</a> • 
          <a href="#">Support</a>
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
  }

  // email text for inactivity
  private generateInactivityEmailText(data: InactivityEmailData): string {
    const lastDate = data.lastSubmissionDate
      ? data.lastSubmissionDate.toLocaleDateString()
      : 'No recent submissions';

    return `
Hello ${data.studentName},

You haven’t submitted any problems in ${data.daysSinceLastSubmission} days. Time to resume practice!

Codeforces Handle: ${data.codeforcesHandle}
Last Submission: ${lastDate}
${data.currentRating ? `Current Rating: ${data.currentRating}` : ''}

Resume now: https://codeforces.com/problemset

Tips:
- Warm up with easier problems
- Review solutions/editorials
- Set small daily goals

© ${new Date().getFullYear()} SPMS • Student Progress Management System  
Privacy Policy: https://spms.com/privacy
Terms: https://spms.com/terms  
Support: https://spms.com/support
  `;
  }
}

export default EmailService;