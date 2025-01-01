import express from 'express'
import { body } from 'express-validator'

import draftController from '../controllers/draftController.js'
import auth from '../middleware/auth.js'
import validate from '../middleware/validate.js'

const router = express.Router()

router.use(auth)

router.post(
	'/',
	[
		body('to').isEmail().withMessage('Valid email required'),
		body('subject').optional().trim(),
		body('text').optional().trim(),
		body('html').optional().trim(),
		validate,
	],
	draftController.saveDraft
)

router.get('/', draftController.getDrafts)

router.put(
	'/:id',
	[
		body('to').optional().isEmail().withMessage('Valid email required'),
		body('subject').optional().trim(),
		body('text').optional().trim(),
		body('html').optional().trim(),
		validate,
	],
	draftController.updateDraft
)

router.delete('/:id', draftController.deleteDraft)

export default router
