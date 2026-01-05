import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}

  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    // TODO: Implement email sending logic
    console.log(`Sending reset password email to ${to} with token ${token}`);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM') || this.configService.get<string>('EMAIL_USER'),
      to,
      subject: 'Reset Your Password',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    // await this.transporter.sendMail(mailOptions); --- uncomment this for Email
  }
}