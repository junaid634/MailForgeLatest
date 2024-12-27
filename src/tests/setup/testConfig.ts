import { vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

export const teardownTestDB = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

// Mock environment variables for tests
process.env.JWT_SECRET = 'test-secret';
process.env.TEST_SMTP_HOST = 'smtp.test.com';
process.env.TEST_SMTP_PORT = '587';
process.env.TEST_SMTP_USER = 'test@test.com';
process.env.TEST_SMTP_PASS = 'testpass';
process.env.TEST_IMAP_HOST = 'imap.test.com';
process.env.TEST_IMAP_PORT = '993';
process.env.TEST_IMAP_USER = 'test@test.com';
process.env.TEST_IMAP_PASS = 'testpass';
process.env.TEST_RECIPIENT_EMAIL = 'recipient@test.com';