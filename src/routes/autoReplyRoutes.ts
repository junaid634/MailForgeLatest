import express from 'express'
import { body } from 'express-validator'

import autoReplyController from '../controllers/authReplyController.js'
import auth from '../middleware/auth.js'
import validate from '../middleware/validate.js'

const router = express.Router()

router.use(auth)

router.post(
	'/',
	[
		body('subject').notEmpty().trim(),
		body('message').notEmpty().trim(),
		body('isEnabled').isBoolean(),
		body('startDate').optional().isISO8601(),
		body('endDate').optional().isISO8601(),
		validate,
	],

	autoReplyController.createAutoReply
)

router.put(
	'/',
	[
		body('subject').optional().trim(),
		body('message').optional().trim(),
		body('isEnabled').optional().isBoolean(),
		body('startDate').optional().isISO8601(),
		body('endDate').optional().isISO8601(),
		validate,
	],
	autoReplyController.updateAutoReply
)

router.get('/', autoReplyController.getAutoReply)

export default router
