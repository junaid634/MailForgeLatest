import imapSimple from 'imap-simple'
import { simpleParser } from 'mailparser'
import { GetEmailsResponse, IUser, ReceivedEmail } from '../types'
import spamFilterService from './spamFilterService'

class EmailReceiver {
	async getEmails(
		user: IUser,
		folder: string = 'INBOX',
		limit: number = 10,
		filterSpam: boolean = true
	): Promise<GetEmailsResponse> {
		try {
			const config = user.emailConfigs.find((c) => c.isDefault)
			if (!config?.imap) {
				throw new Error('IMAP configuration not found or invalid')
			}

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

			for (let i = 0; i < messages.length; i++) {
				const message = messages[i]
				const part = message.parts.find((part) => part.which === 'TEXT')
				if (part) {
					const parsedEmail = await simpleParser(part.body)

					// Check if email is spam
					if (filterSpam) {
						const spamScore = spamFilterService.calculateSpamScore(parsedEmail)
						if (spamScore.isSpam) {
							continue // Skip spam emails
						}
					}

					emails.push({
						id: message.attributes.uid.toString(),
						subject: parsedEmail.subject || '',
						from: parsedEmail.from?.text || '',
						date: parsedEmail.date || new Date(),
						text: parsedEmail.text,
						html: parsedEmail.html || undefined,
					})

					if (emails.length >= limit) {
						break
					}
				}
			}

			connection.end()
			return { success: true, emails }
		} catch (error) {
			console.error('Failed to fetch emails:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
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