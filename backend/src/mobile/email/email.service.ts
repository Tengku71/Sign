import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async sendOtpEmail(email: string, otp: string, type: string): Promise<void> {
    const subject =
      type === 'verification' ? 'Email Verification OTP' : 'Password Reset OTP';

    const title =
      type === 'verification' ? 'Email Verification' : 'Password Reset';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .otp-box { 
            background-color: #f4f4f4; 
            padding: 20px; 
            text-align: center; 
            font-size: 24px; 
            font-weight: bold; 
            border-radius: 8px; 
            margin: 20px 0;
            letter-spacing: 4px;
          }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${title}</h2>
          <p>Thank you for using our service! Please use the following OTP to complete your request:</p>
          <div class="otp-box">${otp}</div>
          <p><strong>This OTP will expire in 10 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          <div class="footer">
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const fromEmail = process.env.SMTP_USER || 'noreply@example.com';

    try {
      await this.transporter.sendMail({
        from: `"Sign" <${fromEmail}>`,
        to: email,
        subject,
        html,
      });

      // console.log(`OTP email sent to ${email}`);
    } catch (error) {
      // console.error('Failed to send email:', error);
      throw new Error('Failed to send OTP email');
    }
  }
}
