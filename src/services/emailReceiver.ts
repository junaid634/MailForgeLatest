import imapSimple from 'imap-simple'
import { simpleParser } from 'mailparser'
import { GetEmailsResponse, IUser, ReceivedEmail } from '../types'
class EmailReceiver {
	async getEmails(
		user: IUser,
		folder: string = 'INBOX',
		limit: number = 10,
		filterSpam: boolean = true
	): Promise<GetEmailsResponse> {
		//
		try {
			console.log(limit)

			const config = user.emailConfigs.find((c) => c.isDefault)
			if (!config?.imap) {
				throw new Error('IMAP configuration not found or invalid')
			}
			console.log('this is config', config)

			const connection = await imapSimple.connect({
				imap: {
					user: config.imap.user,
					password: config.imap.pass,
					host: config.imap.host,
					port: config.imap.port,
					tls: config.imap.tls,
					tlsOptions: { rejectUnauthorized: false },
				},
			})
			const folders = await connection.getBoxes()
			// console.log(folders['[Gmail]'].children)
			if (!folders[folder]) {
				throw new Error(`Folder "${folder}" not found.`)
			}

			await connection.openBox(folder)

			const searchCriteria = ['ALL']
			const fetchOptions = {
				bodies: ['HEADER', 'TEXT'],
				markSeen: false,
			}

			const messages = await connection.search(searchCriteria, fetchOptions)
			const emails: ReceivedEmail[] = []

			// return { success: true, emails: messages }
			for (let i = 0; i < messages.length; i++) {
				const message = messages[i]
				// console.log(message)

				const part = message.parts.find((part) => part.which === 'TEXT')
				if (part) {
					const parsedEmail = await simpleParser(part.body)
					console.log(parsedEmail)

					// Check if email is spam
					// if (filterSpam) {
					// 	const spamScore = spamFilterService.calculateSpamScore(parsedEmail)
					// 	if (spamScore.isSpam) {
					// 		continue // Skip spam emails
					// 	}
					// }

					emails.push({
						id: message.attributes.uid.toString(),
						subject: parsedEmail.subject || '',
						from: parsedEmail.from?.text || '',
						date: parsedEmail.date || new Date(),
						text: parsedEmail.text,
						html: parsedEmail.html || undefined,
						headerLines: parsedEmail.headerLines || undefined,
					})

					if (emails.length >= limit) {
						break
					}
				}
			}

			connection.end()
			const email = await this.cleanEmailData(emails)
			return { success: true, emails: email }
		} catch (error) {
			console.error('Failed to fetch emails:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}
	async cleanEmailData(emails: ReceivedEmail[]): Promise<ReceivedEmail[]> {
		return emails.map((email) => {
			// Clean subject
			const subject = email.subject.trim() || 'No Subject'

			// Clean "from" field
			const from = email.from.trim() || 'Unknown Sender'

			// Clean and sanitize text
			let sanitizedText = ''
			if (email?.text) {
				sanitizedText = this.sanitizeText(email?.text)
			}

			return {
				id: email.id,
				subject,
				from,
				date: new Date(email.date), // Ensure it's a Date object
				text: sanitizedText,
				html: email.html || undefined,
				headerLines: email.headerLines || undefined,
			}
		})
	}

	// Helper function to clean and sanitize text content
	sanitizeText(text: string): string {
		// Remove URLs and unnecessary line breaks, extra spaces, etc.
		return text
			.replace(/<[^>]*>/g, '') // Remove any HTML tags
			.replace(/\n+/g, ' ') // Replace multiple line breaks with a single space
			.replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
			.trim()
	}

	// ... rest of the class implementation
	async markAsRead(
		user: IUser,
		messageId: string,
		folder: string = 'INBOX'
	): Promise<{ success: boolean; error?: string }> {
		try {
			if (!user.emailConfig?.imap) {
				throw new Error('IMAP configuration not found')
			}

			const connection = await imapSimple.connect({
				imap: {
					user: user.emailConfig.imap.user,
					password: user.emailConfig.imap.pass,
					host: user.emailConfig.imap.host,
					port: user.emailConfig.imap.port,
					tls: user.emailConfig.imap.tls,
					tlsOptions: { rejectUnauthorized: false },
				},
			})

			await connection.openBox(folder)
			await connection.addFlags(Number(messageId), ['\\Seen'])
			connection.end()
			return { success: true }
		} catch (error) {
			console.error('Failed to mark email as read:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}
}

export default new EmailReceiver()
