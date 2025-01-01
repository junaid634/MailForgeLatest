import AutoReply from '../models/AutoReply.js'
import { IUser } from '../types'
import { IAutoReply } from '../types/IAutoReply.js'
import emailService from './emailService.js'

class AutoReplyService {
	async handleIncomingEmail(
		user: IUser,
		senderEmail: string,
		originalSubject: string
	) {
		try {
			const autoReply = await AutoReply.findOne({
				userId: user._id,
				isEnabled: true,
				$or: [
					{ startDate: { $exists: false } },
					{
						startDate: { $lte: new Date() },
						endDate: { $gte: new Date() },
					},
				],
			})

			if (!autoReply) return

			const subject = `Re: ${originalSubject}`
			await emailService.sendEmail(user, {
				to: senderEmail,
				subject: autoReply.subject || subject,
				text: autoReply.message,
				html: `<p>${autoReply.message}</p>`,
			})
		} catch (error) {
			console.error('Auto-reply error:', error)
		}
	}

	async createAutoReply(userId: string, data: Partial<IAutoReply>) {
		return AutoReply.create({
			userId,
			...data,
		})
	}

	async updateAutoReply(userId: string, data: Partial<IAutoReply>) {
		return AutoReply.findOneAndUpdate({ userId }, data, { new: true })
	}

	async getAutoReply(userId: string) {
		return AutoReply.findOne({ userId })
	}
}

export default new AutoReplyService()
