import { describe, it, expect } from 'vitest';
const emailReceiver = require('../emailReceiver');

describe('EmailReceiver', () => {
  it('should fetch emails successfully', async () => {
    const result = await emailReceiver.getEmails('INBOX', 5);
    expect(result).toHaveProperty('success');
    if (result.success) {
      expect(Array.isArray(result.emails)).toBe(true);
    }
  });

  it('should mark email as read', async () => {
    const emails = await emailReceiver.getEmails('INBOX', 1);
    if (emails.success && emails.emails.length > 0) {
      const result = await emailReceiver.markAsRead(emails.emails[0].id);
      expect(result).toHaveProperty('success');
    }
  });
});