export type CampaignStatus = 'draft' | 'running' | 'completed' | 'failed';

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  html?: string;
  recipients: string[];
  status: CampaignStatus;
  error?: string;
}