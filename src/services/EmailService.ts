/**
 * Email Service - Phase 5, Task 5.7
 * Integration with SendGrid/SES for sending invitation emails
 * Implements retry logic and error handling
 */

import axios from 'axios';
import logger from '../utils/logger';

interface EmailTemplate {
  family_name: string;
  children: Array<{ name: string; date_of_birth: string }>;
  inviting_parent_name: string;
  invitation_message?: string;
  invitation_url: string;
  expires_at: string;
}

export class EmailService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY_MS = 1000;

  /**
   * Send invitation email via SendGrid
   */
  static async sendInvitationEmail(
    to_email: string,
    template: EmailTemplate
  ): Promise<void> {
    const subject = `Invitation to join ${template.family_name} on CoParent`;
    const htmlContent = this.renderInvitationTemplate(template);

    try {
      await this.sendEmailWithRetry(to_email, subject, htmlContent);
      logger.info('Invitation email sent', { to_email });
    } catch (error) {
      logger.error('Failed to send invitation email after retries', {
        error,
        to_email,
      });
      throw error;
    }
  }

  /**
   * Send email with retry logic (exponential backoff)
   */
  private static async sendEmailWithRetry(
    to: string,
    subject: string,
    html: string,
    attempt: number = 1
  ): Promise<void> {
    try {
      const response = await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [
            {
              to: [{ email: to }],
              subject,
            },
          ],
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || 'noreply@coparent.app',
            name: 'CoParent',
          },
          content: [
            {
              type: 'text/html',
              value: html,
            },
          ],
          tracking_settings: {
            open: { enable: true },
            click: { enable: true },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );

      if (response.status !== 202) {
        throw new Error(`SendGrid returned status ${response.status}`);
      }
    } catch (error: any) {
      // Retry on transient errors (network, timeout)
      if (attempt < this.MAX_RETRIES && this.isRetryableError(error)) {
        const delayMs = this.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        logger.warn('Email send failed, retrying', {
          attempt,
          delayMs,
          error: error.message,
        });

        await this.sleep(delayMs);
        return this.sendEmailWithRetry(to, subject, html, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private static isRetryableError(error: any): boolean {
    // Network errors, timeouts, 5xx errors
    if (!error.response) {
      return true; // Network error
    }

    const status = error.response.status;
    return status >= 500 || status === 408 || status === 429;
  }

  /**
   * Sleep utility
   */
  private static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Render invitation email template
   */
  private static renderInvitationTemplate(template: EmailTemplate): string {
    const childrenHtml = template.children
      .map((child) => `<li>${child.name} (DOB: ${child.date_of_birth})</li>`)
      .join('');

    const messageHtml = template.invitation_message
      ? `<h3>Message from ${template.inviting_parent_name}</h3><p>${template.invitation_message}</p>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
            .content { padding: 20px; background: #f9f9f9; margin: 20px 0; border-radius: 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
            ul { list-style-position: inside; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You're Invited!</h1>
            </div>

            <div class="content">
              <p>Hello,</p>
              <p>You're invited to join the <strong>${template.family_name}</strong> family on CoParent.</p>

              <h3>Family Information</h3>
              <ul>
                ${childrenHtml}
              </ul>

              ${messageHtml}

              <a href="${template.invitation_url}" class="button">Accept Invitation</a>

              <p style="color: #999; font-size: 12px;">
                This link expires on ${template.expires_at}.
                If you didn't expect this invitation, please ignore this email.
              </p>
            </div>

            <div class="footer">
              <p>CoParent - Making co-parenting easier</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
