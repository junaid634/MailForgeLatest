import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import environment from '../config/environments.js'
import User from '../models/User'
import { EmailConfigWithName } from '../types'
import { asyncHandler } from '../utils/asyncHandler'

// Add these new controller methods
const userController = {
	getProfile: asyncHandler(async (req: Request, res: Response) => {
		const user = await User.findById(req.user!._id).select('-password')
		if (!user) {
			return res.status(404).json({ success: false, error: 'User not found' })
		}

		res.json({
			success: true,
			user,
		})
	}),
	updateProfile: asyncHandler(async (req: Request, res: Response) => {
		const { email, currentPassword, newPassword } = req.body

		const user = await User.findById(req.user!._id)
		if (!user) {
			return res.status(404).json({ success: false, error: 'User not found' })
		}

		if (email && email !== user.email) {
			const emailExists = await User.findOne({ email })
			if (emailExists) {
				return res.status(400).json({
					success: false,
					error: 'Email already in use',
				})
			}
			user.email = email
		}

		if (currentPassword && newPassword) {
			const isValidPassword = await user.comparePassword(currentPassword)
			if (!isValidPassword) {
				return res.status(400).json({
					success: false,
					error: 'Current password is incorrect',
				})
			}
			user.password = newPassword
		}

		await user.save()

		res.json({
			success: true,
			user: {
				_id: user._id,
				email: user.email,
				emailConfigs: user.emailConfigs,
			},
		})
	}),
	updateEmailConfig: asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params
		const { name, smtp, imap, isDefault } = req.body

		const user = await User.findById(req.user!._id)
		if (!user) {
			return res.status(404).json({ success: false, error: 'User not found' })
		}

		const configIndex = user.emailConfigs.findIndex(
			(config) => config.id === id
		)
		if (configIndex === -1) {
			return res
				.status(404)
				.json({ success: false, error: 'Configuration not found' })
		}

		if (name) user.emailConfigs[configIndex].name = name
		if (smtp)
			user.emailConfigs[configIndex].smtp = {
				...user.emailConfigs[configIndex].smtp,
				...smtp,
			}
		if (imap)
			user.emailConfigs[configIndex].imap = {
				...user.emailConfigs[configIndex].imap,
				...imap,
			}

		if (isDefault !== undefined) {
			if (isDefault) {
				user.emailConfigs.forEach((config, index) => {
					config.isDefault = index === configIndex
				})
			} else if (
				user.emailConfigs[configIndex].isDefault &&
				user.emailConfigs.length > 1
			) {
				// If removing default status, make another config default
				const newDefaultIndex = configIndex === 0 ? 1 : 0
				user.emailConfigs[newDefaultIndex].isDefault = true
			}
		}

		await user.save()

		res.json({
			success: true,
			emailConfigs: user.emailConfigs,
		})
	}),
	register: asyncHandler(async (req: Request, res: Response) => {
		const { email, password }: { email: string; password: string } = req.body
		if (await User.findOne({ email })) {
			return res.status(400).json({
				success: false,
				error: 'Email already registered',
			})
		}

		const user = await User.create({
			email,
			password,
		})

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
			expiresIn: environment.JWT_SECRET_EXPIRES,
		})

		res.status(201).json({
			success: true,
			token,
		})
	}),

	login: asyncHandler(async (req: Request, res: Response) => {
		const { email, password }: { email: string; password: string } = req.body

		const user = await User.findOne({ email })
		if (!user || !(await user.comparePassword(password))) {
			return res.status(401).json({
				success: false,
				error: 'Invalid credentials',
			})
		}

		const token = jwt.sign(
			{ userId: user._id },
			process.env.JWT_SECRET || 'default-secret'
		)
		console.log(process.env.JWT_SECRET)

		res.json({
			success: true,
			token,
		})
	}),

	addEmailConfig: asyncHandler(async (req: Request, res: Response) => {
		const emailConfig = req.body
		const userId = req.user?._id

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Unauthorized',
			})
		}
		const user = await User.findById(userId)
		if (!user) {
			return res.status(404).json({
				success: false,
				error: 'User not found',
			})
		}

		user.emailConfigs.push(emailConfig)
		// console.log('this is user', user)

		await user.save()
		res.json({
			success: true,
			emailConfig: user.emailConfig,
		})
	}),
	deleteEmailConfig: asyncHandler(async (req: Request, res: Response) => {
		try {
			const emailConfigId = req.params.id
			const userId = req.user?._id

			// Check if userId exists
			if (!userId) {
				return res.status(401).json({
					success: false,
					error: 'Unauthorized',
				})
			}

			// Find the user by ID
			const user = await User.findById(userId)
			if (!user) {
				return res.status(404).json({
					success: false,
					error: 'User not found',
				})
			}

			// Ensure emailConfigs exists
			if (!user.emailConfigs || !Array.isArray(user.emailConfigs)) {
				return res.status(400).json({
					success: false,
					error: 'User does not have email configurations',
				})
			}

			// Find the email configuration by ID
			const emailConfig = user.emailConfigs.find(
				(config: EmailConfigWithName) => config.id.toString() === emailConfigId
			)

			if (!emailConfig) {
				return res.status(404).json({
					success: false,
					error: 'Email configuration not found',
				})
			}

			// Remove the email configuration
			user.emailConfigs = user.emailConfigs.filter(
				(config: EmailConfigWithName) => config.id.toString() !== emailConfigId
			)

			// Save the updated user
			await user.save()

			// Respond with success
			return res.json({
				success: true,
				emailConfigs: user.emailConfigs,
			})
		} catch (error) {
			// Handle errors
			console.error('Error removing email configuration:', error)
			return res.status(500).json({
				success: false,
				error: 'Internal server error',
			})
		}
	}),

	getEmailConfigs: asyncHandler(async (req: Request, res: Response) => {
		try {
			const userId = req.user?._id // Assuming `req.user` contains authenticated user info

			// Check if userId exists
			if (!userId) {
				return res.status(401).json({
					success: false,
					error: 'Unauthorized',
				})
			}

			// Find the user by ID and retrieve only emailConfigs field
			const user = await User.findById(userId, 'emailConfigs').lean()
			if (!user) {
				return res.status(404).json({
					success: false,
					error: 'User not found',
				})
			}

			// Respond with email configurations
			return res.json({
				success: true,
				emailConfigs: user.emailConfigs || [],
			})
		} catch (error) {
			// Handle errors
			console.error('Error fetching email configurations:', error)
			return res.status(500).json({
				success: false,
				error: 'Internal server error',
			})
		}
	}),

	setDefaultEmailConfig: asyncHandler(async (req: Request, res: Response) => {
		try {
			const userId = req.user?._id // Assuming `req.user` contains authenticated user info
			const emailConfigId = req.params.id

			// Check if userId exists
			if (!userId) {
				return res.status(401).json({
					success: false,
					error: 'Unauthorized',
				})
			}

			// Find the user
			const user = await User.findById(userId)
			if (!user) {
				return res.status(404).json({
					success: false,
					error: 'User not found',
				})
			}

			// Ensure emailConfigs exist
			if (!user.emailConfigs || !Array.isArray(user.emailConfigs)) {
				return res.status(400).json({
					success: false,
					error: 'User does not have email configurations',
				})
			}

			// Find the email configuration to set as default
			const emailConfigIndex = user.emailConfigs.findIndex(
				(config) => config.id === emailConfigId
			)

			if (emailConfigIndex === -1) {
				return res.status(404).json({
					success: false,
					error: 'Email configuration not found',
				})
			}

			// Update the isDefault field for all configurations
			user.emailConfigs.forEach((config, index) => {
				config.isDefault = index === emailConfigIndex
			})

			// Save the updated user
			await user.save()

			// Respond with success
			return res.json({
				success: true,
				message: 'Default email configuration updated successfully',
				emailConfigs: user.emailConfigs,
			})
		} catch (error) {
			// Handle errors
			console.error('Error setting default email configuration:', error)
			return res.status(500).json({
				success: false,
				error: 'Internal server error',
			})
		}
	}),
}
// Export all controller methods
export default userController
