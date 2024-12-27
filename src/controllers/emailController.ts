import { Request, Response } from 'express'

import emailReceiver from '../services/emailReceiver'
import emailService from '../services/emailService'
import schedulerService from '../services/schedulerService'
import { asyncHandler } from '../utils/asyncHandler'

export const sendEmail = asyncHandler(async (req: Request, res: Response) => {
	const { to, subject, text, html, emailConfigId } = req.body

	const result = await emailService.sendEmail(
		req.user!,
		{ to, subject, text, html },
		emailConfigId
	)

	if (!result.success) {
		return res.status(400).json(result)
	}

	res.status(200).json(result)
})

export const getEmails = asyncHandler(async (req: Request, res: Response) => {
	const { folder = 'INBOX', limit = '10', includeSpam = 'false' } = req.query

	const result = await emailReceiver.getEmails(
		req.user!,
		folder as string,
		parseInt(limit as string),
		includeSpam === 'false'
	)

	if (!result.success) {
		return res.status(400).json(result)
	}

	res.status(200).json(result)
})

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params
	const { folder = 'INBOX' } = req.query

	const result = await emailReceiver.markAsRead(req.user!, id, folder as string)

	if (!result.success) {
		return res.status(400).json(result)
	}

	res.status(200).json(result)
})

export const scheduleEmail = asyncHandler(
	async (req: Request, res: Response) => {
		const { to, subject, text, html, sendAt, emailConfigId } = req.body

		const scheduleId = await schedulerService.scheduleEmail(req.user!, {
			to,
			subject,
			text,
			html,
			sendAt,
			emailConfigId,
		})

		res.status(201).json({
			success: true,
			scheduleId,
		})
	}
)

export const getScheduledEmails = asyncHandler(
	async (req: Request, res: Response) => {
		const scheduledEmails = await schedulerService.getScheduledEmails(req.user!)

		res.json({
			success: true,
			scheduledEmails,
		})
	}
)

export const cancelScheduledEmail = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params

		await schedulerService.cancelSchedule(id)

		res.json({
			success: true,
			message: 'Scheduled email cancelled',
		})
	}
)

export default {
	sendEmail,
	getEmails,
	markAsRead,
	scheduleEmail,
	getScheduledEmails,
	cancelScheduledEmail,
}
