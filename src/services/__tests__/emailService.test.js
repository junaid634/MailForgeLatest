import { describe, it, expect, vi } from 'vitest';
const emailService = require('../emailService');

describe('EmailService', () => {
  it('should send an email successfully', async () => {
    const testEmail = {
      to: 'test@example.com',
      subject: 'Test',
      text: 'Test email',
      html: '<p>Test email</p>'
    };

    const result = await emailService.sendEmail(testEmail);
    expect(result).toHaveProperty('success');
  });
});