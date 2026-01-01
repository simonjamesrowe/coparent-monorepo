import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

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
  private readonly appUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.fromEmail =
      this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@coparent.dev';
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:5173';

    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.isConfigured = true;
      this.logger.log('SendGrid configured successfully');
    } else {
      this.isConfigured = false;
      this.logger.warn('SendGrid API key not configured - emails will be logged to console');
    }
  }

  async sendInvitation(data: InvitationEmailData): Promise<boolean> {
    const acceptUrl = `${this.appUrl}/invitations/accept?token=${data.token}`;

    const emailContent = {
      to: data.to,
      from: this.fromEmail,
      subject: `You've been invited to join ${data.familyName} on CoParent`,
      text: `
Hi there!

${data.inviterName} has invited you to join "${data.familyName}" on CoParent as a ${data.role}.

CoParent helps families coordinate schedules, share important information, and communicate effectively.

Click the link below to accept the invitation:
${acceptUrl}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

Best,
The CoParent Team
      `.trim(),
      html: `
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
      `.trim(),
    };

    if (!this.isConfigured) {
      this.logger.log('=== EMAIL (not sent - no SendGrid config) ===');
      this.logger.log(`To: ${emailContent.to}`);
      this.logger.log(`Subject: ${emailContent.subject}`);
      this.logger.log(`Accept URL: ${acceptUrl}`);
      this.logger.log('============================================');
      return true;
    }

    try {
      await sgMail.send(emailContent);
      this.logger.log(`Invitation email sent to ${data.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${data.to}`, error);
      return false;
    }
  }
}
