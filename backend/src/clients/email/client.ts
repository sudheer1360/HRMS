/**
 * clients/email/client.ts — Email service client.
 *
 * Extends AbstractClient for external email API calls.
 * Swap the baseURL and auth header to use SendGrid, Mailgun, AWS SES, etc.
 *
 * Usage:
 *   import { emailClient } from '@clients/email/client.js';
 *   await emailClient.sendWelcomeEmail('user@example.com', 'John Doe');
 */
import { AbstractClient } from '../../common/base/AbstractClient.js';

interface EmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{ filename: string; content: string; encoding?: string }>;
}

interface EmailResponse {
  messageId: string;
  status: 'sent' | 'queued' | 'failed';
}

class EmailClient extends AbstractClient {
  constructor() {
    super('EmailClient', process.env.EMAIL_SERVICE_URL || 'http://localhost:3001/email', {
      timeout: 10_000,
      retries: 2,
      retryDelay: 1000,
      defaultHeaders: {
        'X-API-Key': process.env.EMAIL_API_KEY || '',
      },
    });
  }

  async send(payload: EmailPayload): Promise<EmailResponse> {
    return this.post<EmailResponse>('/send', payload);
  }

  async sendWelcomeEmail(to: string, name: string, tenantName: string): Promise<EmailResponse> {
    return this.send({
      to,
      subject: `Welcome to ${tenantName} HR Portal`,
      templateId: 'welcome',
      templateData: { name, tenantName },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<EmailResponse> {
    return this.send({
      to,
      subject: 'Reset Your Password',
      templateId: 'password-reset',
      templateData: { resetLink, expiresIn: '30 minutes' },
    });
  }

  async sendPayslipEmail(to: string, name: string, month: string, pdfBase64: string): Promise<EmailResponse> {
    return this.send({
      to,
      subject: `Your Payslip for ${month}`,
      templateId: 'payslip',
      templateData: { name, month },
      attachments: [
        { filename: `payslip-${month}.pdf`, content: pdfBase64, encoding: 'base64' },
      ],
    });
  }

  async sendLeaveApprovalEmail(to: string, name: string, status: 'approved' | 'rejected', leaveType: string): Promise<EmailResponse> {
    return this.send({
      to,
      subject: `Leave Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      templateId: 'leave-status',
      templateData: { name, status, leaveType },
    });
  }

  async sendOfferLetterEmail(to: string, name: string, offerPdfBase64: string): Promise<EmailResponse> {
    return this.send({
      to,
      subject: 'Your Offer Letter',
      templateId: 'offer-letter',
      templateData: { name },
      attachments: [
        { filename: 'offer-letter.pdf', content: offerPdfBase64, encoding: 'base64' },
      ],
    });
  }
}

export const emailClient = new EmailClient();
export default emailClient;
