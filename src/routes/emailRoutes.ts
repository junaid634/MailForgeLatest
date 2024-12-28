import { Router } from 'express'
import { body, query } from 'express-validator'
import emailController from '../controllers/emailController'
import auth from '../middleware/auth'
import validate from '../middleware/validate'

const router = Router()

router.use(auth)

// Get emails with spam filtering
router.get(
	'/',
	[
		query('folder').optional().default('INBOX'),
		query('limit').optional().isInt({ min: 1, max: 50 }).default(10),
		query('includeSpam').optional().isBoolean().default(false),
		validate,
	],
	emailController.getEmails
)

// Send email
router.post(
	'/send',

	[
		body('to').isEmail().withMessage('Valid email required'),
		body('subject').notEmpty().withMessage('Subject is required'),
		body('text').optional(),
		body('html').optional(),
		body('emailConfigId').optional().isString(),
		validate,
	],
	emailController.sendEmail
)

// Schedule email
router.post(
	'/schedule',
	[
		body('to').isEmail().withMessage('Valid email required'),
		body('subject').notEmpty().withMessage('Subject is required'),
		body('text').optional(),
		body('html').optional(),
		body('scheduledTime').isISO8601().withMessage('Valid ISO date required'),
		body('emailConfigId').optional().isString(),
		validate,
	],
	emailController.scheduleEmail
)

// Mark email as read
router.patch(
	'/:id/read',
	[query('folder').default('INBOX'), validate],
	emailController.markAsRead
)

// Get scheduled emails
router.get('/scheduled', emailController.getScheduledEmails)

// Cancel scheduled email
router.delete('/scheduled/:id', emailController.cancelScheduledEmail)

export default router
