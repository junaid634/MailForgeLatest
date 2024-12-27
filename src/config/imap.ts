import { IMAPConfig } from '../types/config';

export const createIMAPConfig = (): IMAPConfig => ({
  imap: {
    user: process.env.IMAP_USER || '',
    password: process.env.IMAP_PASS || '',
    host: process.env.IMAP_HOST || '',
    port: parseInt(process.env.IMAP_PORT || '993'),
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  }
});

export default createIMAPConfig();