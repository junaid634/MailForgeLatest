import { Router } from 'express'
import { body } from 'express-validator'
import userController from '../controllers/userController.js'
import auth from '../middleware/auth.js'
import validate from '../middleware/validate.js'

const router = Router()

// Register user
router.post(
	'/register',
	[
		body('email').isEmail().withMessage('Valid email required'),
		body('password')
			.isLength({ min: 6 })
			.withMessage('Password must be at least 6 characters'),
		validate,
	],
	userController.register
)

// Login user
router.post(
	'/login',
	[
		body('email').isEmail().withMessage('Valid email required'),
		body('password').notEmpty().withMessage('Password is required'),
		validate,
	],
	userController.login
)

// Get user profile
router.get('/profile', auth, userController.getProfile)

// Update user profile
router.put(
	'/profile',
	auth,
	[
		body('email').optional().isEmail().withMessage('Valid email required'),
		body('currentPassword').optional().notEmpty(),
		body('newPassword')
			.optional()
			.isLength({ min: 6 })
			.withMessage('Password must be at least 6 characters'),
		validate,
	],
	userController.updateProfile
)

// Email configuration routes
router.post(
	'/email-config',
	auth,
	[
		body('name').notEmpty().withMessage('Configuration name is required'),
		body('smtp.host').notEmpty().withMessage('SMTP host is required'),
		body('smtp.port').isInt().withMessage('Valid SMTP port required'),
		body('smtp.user').notEmpty().withMessage('SMTP user is required'),
		body('smtp.pass').notEmpty().withMessage('SMTP password is required'),
		body('imap.host').notEmpty().withMessage('IMAP host is required'),
		body('imap.port').isInt().withMessage('Valid IMAP port required'),
		body('imap.user').notEmpty().withMessage('IMAP user is required'),
		body('imap.pass').notEmpty().withMessage('IMAP password is required'),
		body('isDefault').optional().isBoolean(),
		validate,
	],
	userController.addEmailConfig
)

router.get('/email-configs', auth, userController.getEmailConfigs)

router.put(
	'/email-config/:id',
	auth,
	[
		body('name').optional().notEmpty(),
		body('smtp').optional(),
		body('imap').optional(),
		body('isDefault').optional().isBoolean(),
		validate,
	],
	userController.updateEmailConfig
)

router.delete('/email-config/:id', auth, userController.deleteEmailConfig)

router.patch(
	'/email-config/:id/default',
	auth,
	userController.setDefaultEmailConfig
)

export default router
