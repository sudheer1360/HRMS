/**
 * clients/sms/client.ts — SMS / OTP service client.
 *
 * Extends AbstractClient for SMS gateway calls (Twilio, AWS SNS, MSG91, etc.)
 *
 * Usage:
 *   import { smsClient } from '@clients/sms/client.js';
 *   await smsClient.sendOTP('+919876543210', '123456');
 */
import { AbstractClient } from '../../common/base/AbstractClient.js';

interface SmsPayload {
  to: string;
  message: string;
  templateId?: string;
  variables?: string[];
}

interface SmsResponse {
  messageId: string;
  status: 'sent' | 'queued' | 'failed';
  credits?: number;
}

class SmsClient extends AbstractClient {
  constructor() {
    super('SmsClient', process.env.SMS_SERVICE_URL || 'http://localhost:3002/sms', {
      timeout: 8_000,
      retries: 2,
      defaultHeaders: {
        'authkey': process.env.SMS_AUTH_KEY || '',
      },
    });
  }

  async send(payload: SmsPayload): Promise<SmsResponse> {
    return this.post<SmsResponse>('/send', payload);
  }

  async sendOTP(mobile: string, otp: string): Promise<SmsResponse> {
    return this.send({
      to: mobile,
      message: `Your HRMS verification OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`,
      templateId: process.env.SMS_OTP_TEMPLATE_ID,
      variables: [otp],
    });
  }

  async sendLeaveAlert(mobile: string, employeeName: string, leaveType: string, status: string): Promise<SmsResponse> {
    return this.send({
      to: mobile,
      message: `Hi ${employeeName}, your ${leaveType} request has been ${status}. -HRMS`,
      templateId: process.env.SMS_LEAVE_TEMPLATE_ID,
      variables: [employeeName, leaveType, status],
    });
  }

  async sendPayslipAlert(mobile: string, month: string): Promise<SmsResponse> {
    return this.send({
      to: mobile,
      message: `Your payslip for ${month} is now available on the HRMS portal.`,
      templateId: process.env.SMS_PAYSLIP_TEMPLATE_ID,
      variables: [month],
    });
  }
}

export const smsClient = new SmsClient();
export default smsClient;
