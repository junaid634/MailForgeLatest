import { Request, Response } from 'express'
import autoReplyService from '../services/autoReplyService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
const autoReplyController = {
	createAutoReply: asyncHandler(async (req: Request, res: Response) => {
		const autoReply = await autoReplyService.createAutoReply(
			req.user!._id,
			req.body
		)
		res.status(201).json({ success: true, autoReply })
	}),

	updateAutoReply: asyncHandler(async (req: Request, res: Response) => {
		const autoReply = await autoReplyService.updateAutoReply(
			req.user!._id,
			req.body
		)
		res.json({ success: true, autoReply })
	}),

	getAutoReply: asyncHandler(async (req: Request, res: Response) => {
		const autoReply = await autoReplyService.getAutoReply(req.user!._id)
		res.json({ success: true, autoReply })
	}),
}
export default autoReplyController
