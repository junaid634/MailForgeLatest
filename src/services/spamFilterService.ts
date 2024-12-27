import { ParsedMail, simpleParser } from 'mailparser'
import { IUser } from '../types/index.js'
import { SpamEmail, SpamScore } from '../types/spam.js'
import emailReceiver from './emailReceiver'

export class SpamFilterService {
	private spamKeywords = [
		'viagra',
		'lottery',
		'winner',
		'inheritance',
		'prince',
		'bank transfer',
		'free money',
		'casino',
		'prize',
		'investment opportunity',
		'cryptocurrency deal',
	]

	private spamPatterns = [
		/\$\d+[,\d]*\s*(USD|EUR|GBP)/i,
		/\b\d+%\s*returns?\b/i,
		/\b(free|win|won|winner|winning)\b/i,
		/\b(urgent|immediate|action required)\b/i,
		/\b(bitcoin|crypto|cryptocurrency)\b/i,
	]

	public calculateSpamScore(email: ParsedMail): SpamScore {
		let score = 0
		const reasons: string[] = []

		// Check subject
		const subject = email.subject?.toLowerCase() || ''
		this.spamKeywords.forEach((keyword) => {
			if (subject.includes(keyword.toLowerCase())) {
				score += 2
				reasons.push(`Spam keyword "${keyword}" found in subject`)
			}
		})

		// Check content
		const content = (email.text || '').toLowerCase()
		this.spamKeywords.forEach((keyword) => {
			if (content.includes(keyword.toLowerCase())) {
				score += 1
				reasons.push(`Spam keyword "${keyword}" found in content`)
			}
		})

		// Check patterns
		this.spamPatterns.forEach((pattern) => {
			if (pattern.test(subject)) {
				score += 2
				reasons.push(`Suspicious pattern found in subject: ${pattern}`)
			}
			if (pattern.test(content)) {
				score += 1
				reasons.push(`Suspicious pattern found in content: ${pattern}`)
			}
		})

		// Check for excessive capitalization
		const capsRatio = (subject.match(/[A-Z]/g) || []).length / subject.length
		if (capsRatio > 0.5) {
			score += 2
			reasons.push('Excessive capitalization in subject')
		}

		// Check for multiple exclamation marks
		if (/!!+/.test(subject)) {
			score += 1
			reasons.push('Multiple exclamation marks in subject')
		}

		return {
			score,
			isSpam: score >= 5,
			reasons,
		}
	}

	async getSpamEmails(
		user: IUser,
		folder: string = 'INBOX',
		limit: number = 50
	): Promise<SpamEmail[]> {
		const result = await emailReceiver.getEmails(user, folder, limit)

		if (!result.success || !result.emails) {
			return []
		}

		const spamEmails: SpamEmail[] = []

		for (const email of result.emails) {
			const parsedEmail = await simpleParser(email.text || '')
			const spamScore = this.calculateSpamScore(parsedEmail)

			if (spamScore.isSpam) {
				spamEmails.push({
					...email,
					spamScore,
				})
			}
		}

		return spamEmails
	}
}

export default new SpamFilterService()
