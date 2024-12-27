import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { setupTestDB, teardownTestDB } from '../setup/testConfig';
import app from '../../server';
import User from '../../models/User';
import { IUser } from '../../types';

describe('Email API E2E Tests', () => {
  let authToken: string;
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

    authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET as string);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await teardownTestDB();
  });

  describe('POST /api/emails/send', () => {
    it('should send email successfully', async () => {
      const response = await request(app)
        .post('/api/emails/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          to: process.env.TEST_RECIPIENT_EMAIL,
          subject: 'E2E Test',
          text: 'Test email content'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.messageId).toBeDefined();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/emails/send')
        .send({
          to: process.env.TEST_RECIPIENT_EMAIL,
          subject: 'E2E Test',
          text: 'Test email content'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/emails', () => {
    it('should fetch emails successfully', async () => {
      const response = await request(app)
        .get('/api/emails')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ folder: 'INBOX', limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.emails)).toBe(true);
    });
  });
});