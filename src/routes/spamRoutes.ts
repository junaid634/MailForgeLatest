import { Router } from 'express'
import { query } from 'express-validator'

import { getSpamEmails } from '../controllers/spamController'
import auth from '../middleware/auth'
import validate from '../middleware/validate'

const router = Router()

router.use(auth)

router.get(
	'/',
	[
		query('folder').default('INBOX'),
		query('limit').isInt({ min: 1, max: 100 }).default(50),
		validate,
	],
	getSpamEmails
)

export default router
