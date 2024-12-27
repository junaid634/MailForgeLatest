import { describe, it, expect, vi, beforeEach } from 'vitest';
import imapSimple from 'imap-simple';
import EmailReceiver from '../../services/emailReceiver';
import { IUser } from '../../types';

vi.mock('imap-simple');

describe('EmailReceiver', () => {
  const mockUser = {
    emailConfig: {
      imap: {
        user: 'test@test.com',
        pass: 'password',
        host: 'imap.test.com',
        port: 993,
        tls: true
      }
    }
  } as IUser;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch emails successfully', async () => {
    const mockMessages = [{
      attributes: { uid: '123' },
      parts: [{ which: 'TEXT', body: 'Test email content' }]
    }];

    (imapSimple.connect as any).mockResolvedValue({
      openBox: vi.fn(),
      search: vi.fn().mockResolvedValue(mockMessages),
      end: vi.fn()
    });

    const emailReceiver = new EmailReceiver();
    const result = await emailReceiver.getEmails(mockUser);

    expect(result.success).toBe(true);
    expect(result.emails).toHaveLength(1);
    expect(result.emails[0].id).toBe('123');
  });

  it('should handle missing IMAP config', async () => {
    const emailReceiver = new EmailReceiver();
    const result = await emailReceiver.getEmails({} as IUser);

    expect(result.success).toBe(false);
    expect(result.error).toBe('IMAP configuration not found');
  });
});