import { Request, Response } from 'express'

import spamFilterService from '../services/spamFilterService'
import { asyncHandler } from '../utils/asyncHandler'

export const getSpamEmails = asyncHandler(
	async (req: Request, res: Response) => {
		const { folder = 'INBOX', limit = '50' } = req.query

		const spamEmails = await spamFilterService.getSpamEmails(
			req.user!,
			folder as string,
			parseInt(limit as string)
		)

		res.json({
			success: true,
			spamEmails,
		})
	}
)
