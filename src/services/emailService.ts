import nodemailer from 'nodemailer'
import User from '../models/User.js'
import { EmailConfig, EmailData, EmailResponse, IUser } from '../types'

class EmailService {
	private createTransporter(smtpConfig: EmailConfig['smtp']) {
		return nodemailer.createTransport({
			host: smtpConfig.host,
			port: smtpConfig.port,
			secure: smtpConfig.secure,
			auth: {
				user: smtpConfig.user,
				pass: smtpConfig.pass,
			},
		})
	}

	async sendEmail(
		user: IUser,
		{ to, subject, text, html }: EmailData,
		emailConfigId?: string | undefined
	): Promise<EmailResponse> {
		try {
			if (!user.emailConfig?.smtp) {
				throw new Error('SMTP configuration not found')
			}
			const userEmail = await User.findById(user._id)
				.select('emailConfigs')
				.lean()
			if (!userEmail) {
				throw new Error('User not found')
			}
			const [emailConfig] = userEmail.emailConfigs.filter(
				(e) => e.id === emailConfigId
			)
			const transporter = this.createTransporter(emailConfig.smtp)

			const result = await transporter.sendMail({
				from: emailConfig.smtp.user,
				to,
				subject,
				text,
				html,
			})

			return { success: true, messageId: result.messageId }
		} catch (error) {
			console.error('Email sending failed:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}
}

export default new EmailService()
