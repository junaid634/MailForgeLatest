import { Request, Response } from 'express'
import Draft from '../models/Draft.js'
import { asyncHandler } from '../utils/asyncHandler.js'
const DraftController = {
	saveDraft: asyncHandler(async (req: Request, res: Response) => {
		const { to, subject, text, html } = req.body
		const draft = await Draft.create({
			userId: req.user?._id,
			to,
			subject,
			text,
			html,
		})

		res.status(201).json({
			success: true,
			draft,
		})
	}),

	getDrafts: asyncHandler(async (req: Request, res: Response) => {
		const drafts = await Draft.find({ userId: req.user?._id }).sort({
			lastModified: -1,
		})

		res.json({
			success: true,
			drafts,
		})
	}),
	updateDraft: asyncHandler(async (req: Request, res: Response) => {
		const draft = await Draft.findOneAndUpdate(
			{ _id: req.params.id, userId: req.user?._id },
			req.body,
			{ new: true }
		)

		if (!draft) {
			return res.status(404).json({
				success: false,
				error: 'Draft not found',
			})
		}

		res.json({
			success: true,
			draft,
		})
	}),

	deleteDraft: asyncHandler(async (req: Request, res: Response) => {
		const draft = await Draft.findOneAndDelete({
			_id: req.params.id,
			userId: req.user?._id,
		})

		if (!draft) {
			return res.status(404).json({
				success: false,
				error: 'Draft not found',
			})
		}

		res.json({
			success: true,
			message: 'Draft deleted successfully',
		})
	}),
}
export default DraftController
