const { describe, it, expect, vi } = require('vitest');
const EmailService = require('../../services/emailService');
const nodemailer = require('nodemailer');

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
  };

  const mockEmail = {
    to: 'recipient@test.com',
    subject: 'Test Email',
    text: 'Test content',
    html: '<p>Test content</p>'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create transporter with correct config', () => {
    const emailService = new EmailService();
    emailService.createTransporter(mockUser.emailConfig.smtp);
    
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: mockUser.emailConfig.smtp.host,
      port: mockUser.emailConfig.smtp.port,
      secure: mockUser.emailConfig.smtp.secure,
      auth: {
        user: mockUser.emailConfig.smtp.user,
        pass: mockUser.emailConfig.smtp.pass
      }
    });
  });

  it('should send email successfully', async () => {
    const mockSendMail = vi.fn().mockResolvedValue({ messageId: '123' });
    nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

    const emailService = new EmailService();
    const result = await emailService.sendEmail(mockUser, mockEmail);

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('123');
    expect(mockSendMail).toHaveBeenCalledWith({
      from: mockUser.emailConfig.smtp.user,
      ...mockEmail
    });
  });

  it('should handle missing SMTP config', async () => {
    const emailService = new EmailService();
    const result = await emailService.sendEmail({}, mockEmail);

    expect(result.success).toBe(false);
    expect(result.error).toBe('SMTP configuration not found');
  });
});