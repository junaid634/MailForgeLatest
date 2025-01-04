import { Router } from 'express'
import { query } from 'express-validator'

import { getSpamEmails } from '../controllers/spamController'
import auth from '../middleware/auth'
import validate from '../middleware/validate'

const router = Router()

router.use(auth)
// Get spam emails
router.get(
	'/',
	[
		query('folder').optional().default('INBOX'),
		query('limit').optional().isInt({ min: 1, max: 100 }).default(50),
		validate,
	],
	getSpamEmails
)

export default router
