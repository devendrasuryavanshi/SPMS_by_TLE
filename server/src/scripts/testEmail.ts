import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful');

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'Test Email from SPMS',
      text: 'If you receive this, email configuration is working!',
      html: '<h1>✅ Email Configuration Working!</h1><p>SPMS can now send emails.</p>'
    });

    console.log('✅ Test email sent:', info.messageId);
  } catch (error: any) {
    console.error('❌ Email configuration failed:', error.message);
  }
}

testEmail();
