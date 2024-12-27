import { ReceivedEmail } from './index';

export interface SpamScore {
  score: number;
  isSpam: boolean;
  reasons: string[];
}

export interface SpamEmail extends ReceivedEmail {
  spamScore: SpamScore;
}