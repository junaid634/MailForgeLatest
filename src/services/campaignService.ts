import { IUser } from '../types'
import { Campaign } from '../types/campaign'
import { AnalyticsService } from './analyticsService'
import EmailService from './emailService.js'

export class CampaignService {
	private campaigns: Map<string, Campaign> = new Map()

	private analyticsService: AnalyticsService

	constructor() {
		this.analyticsService = new AnalyticsService()
	}

	async createCampaign(
		user: IUser,
		campaign: Omit<Campaign, 'id' | 'status'>
	): Promise<string> {
		const campaignId = crypto.randomUUID()
		const newCampaign: Campaign = {
			...campaign,
			id: campaignId,
			status: 'draft',
		}

		this.campaigns.set(campaignId, newCampaign)
		return campaignId
	}

	async startCampaign(user: IUser, campaignId: string): Promise<void> {
		const campaign = this.campaigns.get(campaignId)
		if (!campaign) throw new Error('Campaign not found')

		campaign.status = 'running'
		await this.processCampaign(user, campaign)
	}

	private async processCampaign(
		user: IUser,
		campaign: Campaign
	): Promise<void> {
		try {
			for (const recipient of campaign.recipients) {
				const result = await EmailService.sendEmail(user, {
					to: recipient,
					subject: campaign.subject,
					text: campaign.content,
					html: campaign.html,
				})

				if (result.success && result.messageId) {
					this.analyticsService.trackEmail(result.messageId, 'sent')
				}
			}

			campaign.status = 'completed'
		} catch (error) {
			campaign.status = 'failed'
			campaign.error = error instanceof Error ? error.message : 'Unknown error'
		}
	}
}

export default new CampaignService()
