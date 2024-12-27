import { describe, it, expect, vi, beforeEach } from 'vitest';
import nodemailer from 'nodemailer';
import EmailService from '../../services/emailService';
import { IUser } from '../../types';

vi.mock('nodemailer');

describe('EmailService', () => {
  const mockUser = {
    emailConfig: {
      smtp: {
        host: 'smtp.test.com',
        port: 587,
        secure: true,
        user: 'test@test.com',
        pass: 'password'
      }
    }
  } as IUser;

  const mockEmail = {
    to: 'recipient@test.com',
    subject: 'Test Email',
    text: 'Test content',
    html: '<p>Test content</p>'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send email successfully', async () => {
    const mockSendMail = vi.fn().mockResolvedValue({ messageId: '123' });
    (nodemailer.createTransport as any).mockReturnValue({ sendMail: mockSendMail });

    const emailService = new EmailService();
    const result = await emailService.sendEmail(mockUser, mockEmail);

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('123');
    expect(mockSendMail).toHaveBeenCalledWith({
      from: mockUser.emailConfig?.smtp.user,
      ...mockEmail
    });
  });

  it('should handle missing SMTP config', async () => {
    const emailService = new EmailService();
    const result = await emailService.sendEmail({} as IUser, mockEmail);

    expect(result.success).toBe(false);
    expect(result.error).toBe('SMTP configuration not found');
  });
});