import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDB, teardownTestDB } from '../setup/testConfig';
import User from '../../models/User';
import EmailService from '../../services/emailService';
import EmailReceiver from '../../services/emailReceiver';
import { IUser } from '../../types';

describe('Email Integration Tests', () => {
  let testUser: IUser;

  beforeAll(async () => {
    await setupTestDB();
    
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      emailConfig: {
        smtp: {
          host: process.env.TEST_SMTP_HOST,
          port: parseInt(process.env.TEST_SMTP_PORT || '587'),
          secure: true,
          user: process.env.TEST_SMTP_USER,
          pass: process.env.TEST_SMTP_PASS
        },
        imap: {
          host: process.env.TEST_IMAP_HOST,
          port: parseInt(process.env.TEST_IMAP_PORT || '993'),
          user: process.env.TEST_IMAP_USER,
          pass: process.env.TEST_IMAP_PASS,
          tls: true
        }
      }
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await teardownTestDB();
  });

  it('should send and receive email', async () => {
    const emailService = new EmailService();
    const emailReceiver = new EmailReceiver();

    const sendResult = await emailService.sendEmail(testUser, {
      to: process.env.TEST_RECIPIENT_EMAIL as string,
      subject: 'Integration Test',
      text: 'Test email content'
    });

    expect(sendResult.success).toBe(true);
    expect(sendResult.messageId).toBeDefined();

    const receiveResult = await emailReceiver.getEmails(testUser);
    expect(receiveResult.success).toBe(true);
    
    const testEmail = receiveResult.emails?.find(
      email => email.subject === 'Integration Test'
    );
    expect(testEmail).toBeDefined();
    expect(testEmail?.text).toContain('Test email content');
  });
});