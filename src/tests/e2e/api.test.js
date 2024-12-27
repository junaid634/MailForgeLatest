const { describe, it, expect, beforeAll, afterAll } = require('vitest');
const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

describe('Email API E2E Tests', () => {
  let authToken;
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

    authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
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

  describe('PATCH /api/emails/:id/read', () => {
    it('should mark email as read', async () => {
      // First get an email ID
      const emailsResponse = await request(app)
        .get('/api/emails')
        .set('Authorization', `Bearer ${authToken}`);

      const emailId = emailsResponse.body.emails[0]?.id;

      if (emailId) {
        const response = await request(app)
          .patch(`/api/emails/${emailId}/read`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });
  });
});