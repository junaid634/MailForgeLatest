export type EmailEvent = 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced';

export interface EmailAnalytics {
  emailId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  events: Array<{
    type: EmailEvent;
    timestamp: Date;
  }>;
}

export interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}