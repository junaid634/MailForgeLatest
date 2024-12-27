import { EmailAnalytics, EmailEvent, EmailStats } from '../types/analytics';

export class AnalyticsService {
  private analytics: Map<string, EmailAnalytics> = new Map();

  trackEmail(emailId: string, event: EmailEvent): void {
    const analytics = this.analytics.get(emailId) || {
      emailId,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      events: []
    };

    analytics.events.push({
      type: event,
      timestamp: new Date()
    });

    switch (event) {
      case 'sent':
        analytics.sent++;
        break;
      case 'delivered':
        analytics.delivered++;
        break;
      case 'opened':
        analytics.opened++;
        break;
      case 'clicked':
        analytics.clicked++;
        break;
      case 'bounced':
        analytics.bounced++;
        break;
    }

    this.analytics.set(emailId, analytics);
  }

  getEmailStats(emailId: string): EmailStats {
    const analytics = this.analytics.get(emailId);
    if (!analytics) {
      return {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0
      };
    }

    const { sent, delivered, opened, clicked, bounced } = analytics;
    return { sent, delivered, opened, clicked, bounced };
  }
}

export default new AnalyticsService();