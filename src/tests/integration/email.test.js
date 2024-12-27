const { describe, it, expect, beforeAll, afterAll } = require('vitest');
const mongoose = require('mongoose');
const User = require('../../models/User');
const EmailService = require('../../services/emailService');
const EmailReceiver = require('../../services/emailReceiver');

describe('Email Integration Tests', () => {
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      emailConfig: {
        smtp: {
          host: process.env.TEST_SMTP_HOST,
          port: parseInt(process.env.TEST_SMTP_PORT),
          secure: true,
          user: process.env.TEST_SMTP_USER,
          pass: process.env.TEST_SMTP_PASS
        },
        imap: {
          host: process.env.TEST_IMAP_HOST,
          port: parseInt(process.env.TEST_IMAP_PORT),
          user: process.env.TEST_IMAP_USER,
          pass: process.env.TEST_IMAP_PASS,
          tls: true
        }
      }
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should send and receive email', async () => {
    const emailService = new EmailService();
    const emailReceiver = new EmailReceiver();

    // Send test email
    const sendResult = await emailService.sendEmail(testUser, {
      to: process.env.TEST_RECIPIENT_EMAIL,
      subject: 'Integration Test',
      text: 'Test email content'
    });

    expect(sendResult.success).toBe(true);
    expect(sendResult.messageId).toBeDefined();

    // Wait for email to be delivered
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check received emails
    const receiveResult = await emailReceiver.getEmails(testUser);
    expect(receiveResult.success).toBe(true);
    
    const testEmail = receiveResult.emails.find(
      email => email.subject === 'Integration Test'
    );
    expect(testEmail).toBeDefined();
    expect(testEmail.text).toContain('Test email content');
  });
});