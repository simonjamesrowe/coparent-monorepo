import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

export interface InvitationEmailData {
  to: string;
  inviterName: string;
  familyName: string;
  token: string;
  role: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly isConfigured: boolean;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly appUrl: string;
  private readonly transporter?: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const smtpHost = this.configService.get<string>('BREVO_SMTP_HOST') || 'smtp-relay.brevo.com';
    const configuredPort = Number(this.configService.get<string>('BREVO_SMTP_PORT') || 587);
    const smtpPort = Number.isNaN(configuredPort) ? 587 : configuredPort;
    const smtpUser = this.configService.get<string>('BREVO_SMTP_USER');
    const smtpPass = this.configService.get<string>('BREVO_SMTP_PASS');

    this.fromEmail = this.configService.get<string>('BREVO_FROM_EMAIL') || 'coparent@simonrowe.dev';
    this.fromName = this.configService.get<string>('BREVO_FROM_NAME') || 'CoParent';
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:5173';

    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.isConfigured = true;
      this.logger.log('Brevo SMTP configured successfully');
    } else {
      this.isConfigured = false;
      this.logger.warn('Brevo SMTP credentials not configured - emails will be logged to console');
    }
  }

  async sendInvitation(data: InvitationEmailData): Promise<boolean> {
    const acceptUrl = `${this.appUrl}/invitations/accept?token=${data.token}`;

    const subject = `You've been invited to join ${data.familyName} on CoParent`;
    const textContent = `
Hi there!

${data.inviterName} has invited you to join "${data.familyName}" on CoParent as a ${data.role}.

CoParent helps families coordinate schedules, share important information, and communicate effectively.

Click the link below to accept the invitation:
${acceptUrl}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

Best,
The CoParent Team
      `.trim();
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">CoParent</h1>
  </div>

  <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
    <h2 style="color: #0f172a; margin-top: 0;">You're Invited!</h2>

    <p><strong>${data.inviterName}</strong> has invited you to join "<strong>${data.familyName}</strong>" on CoParent as a <strong>${data.role}</strong>.</p>

    <p>CoParent helps families coordinate schedules, share important information, and communicate effectively.</p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">Accept Invitation</a>
    </div>

    <p style="color: #64748b; font-size: 14px;">This invitation will expire in 7 days.</p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

    <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">If you didn't expect this invitation, you can safely ignore this email.</p>
  </div>
</body>
</html>
      `.trim();

    if (!this.isConfigured) {
      this.logger.log('=== EMAIL (not sent - no Brevo SMTP config) ===');
      this.logger.log(`To: ${data.to}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Accept URL: ${acceptUrl}`);
      this.logger.log('============================================');
      return true;
    }

    try {
      await this.transporter?.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: data.to,
        subject,
        text: textContent,
        html: htmlContent,
      });
      this.logger.log(`Invitation email sent to ${data.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${data.to}`, error);
      return false;
    }
  }
}
