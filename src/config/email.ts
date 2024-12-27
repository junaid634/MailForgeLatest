import nodemailer from 'nodemailer';
import { SMTPConfig } from '../types/config';

export const createSMTPConfig = (): SMTPConfig => ({
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

export const createTransporter = (config: SMTPConfig) => 
  nodemailer.createTransport(config);

export default createTransporter(createSMTPConfig());