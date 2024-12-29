import { Request, Response, Router } from 'express'
import { google } from 'googleapis'
import { oAuth2Client } from '../services/Auth0Services'

const authRouter = Router()
authRouter.get('/url', (_, res) => {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: [
			'https://www.googleapis.com/auth/gmail.readonly',
			'https://www.googleapis.com/auth/gmail.send',
		],
	})
	res.send({ url: authUrl })
})

// 2. Handle OAuth Callback for a user
authRouter.get('/google', async (req: Request, res: Response): Promise<any> => {
	const code = req.query.code as string
	if (!code) {
		return res.status(400).send({ error: 'Authorization code is required.' })
	}

	try {
		const data = await oAuth2Client.getToken(code)
		console.log(data)

		oAuth2Client.setCredentials(data.tokens)
		res.send({ tokens: data.tokens })
	} catch (error) {
		console.error('Error exchanging authorization code:', error)
		res.status(500).send({ error: 'Failed to exchange authorization code.' })
	}
})

// 3. Get User Emails
authRouter.get('/emails', async (req: Request, res: Response): Promise<any> => {
	const token = req.headers['authorization']
	let accessToken = ''
	if (token && token.startsWith('Bearer ')) {
		accessToken = token.split(' ')[1]
		console.log(token)
	} else {
		console.log('No bearer token provided')
	}

	if (!accessToken) {
		return res.status(401).send({ error: 'Access token is required.' })
	}
	console.log(accessToken)

	try {
		oAuth2Client.setCredentials({ access_token: accessToken })
		const gmail = google.gmail({ version: 'v1', auth: oAuth2Client })

		const messagesResponse = await gmail.users.messages.list({
			userId: 'me',
			maxResults: 10,
		})

		const messages = messagesResponse.data.messages || []
		const emails = await Promise.all(
			messages.map(async (message) => {
				const email = await gmail.users.messages.get({
					userId: 'me',
					id: message.id!,
				})

				const headers = email.data.payload?.headers || []
				const getHeaderValue = (name: string) =>
					headers.find(
						(header) => header?.name?.toLowerCase() === name.toLowerCase()
					)?.value || ''

				const body = email.data.payload?.body?.data
					? Buffer.from(email.data.payload.body.data, 'base64').toString(
							'utf-8'
					  )
					: ''

				return {
					id: email.data.id,
					threadId: email.data.threadId,
					from: getHeaderValue('From'),
					to: getHeaderValue('To'),
					subject: getHeaderValue('Subject'),
					snippet: email.data.snippet,
					date: getHeaderValue('Date'),
					body: body,
				}
			})
		)

		res.send({ emails })
	} catch (error) {
		console.error('Error fetching emails:', error)
		res.status(500).send({ error: 'Failed to fetch emails.' })
	}
})

// 4. Send Email on behalf of a user
authRouter.post('/send-email', async (req, res): Promise<any> => {
	const { to, subject, body } = req.body
	const token = req.headers['authorization']
	let accessToken = ''
	if (token && token.startsWith('Bearer ')) {
		accessToken = token.split(' ')[1]
		console.log(accessToken)
	} else {
		console.log('No bearer token provided')
	}

	if (!accessToken) {
		return res.status(401).send({ error: 'Access token is required.' })
	}

	try {
		oAuth2Client.setCredentials({ access_token: accessToken })
		const gmail = google.gmail({ version: 'v1', auth: oAuth2Client })

		const encodedMessage = Buffer.from(
			`To: ${to}\nSubject: ${subject}\n\n${body}`
		).toString('base64')

		await gmail.users.messages.send({
			userId: 'me',
			requestBody: {
				raw: encodedMessage
					.replace(/\+/g, '-')
					.replace(/\//g, '_')
					.replace(/=+$/, ''),
			},
		})

		res.send({ message: 'Email sent successfully.' })
	} catch (error) {
		console.error('Error sending email:', error)
		res.status(500).send({ error: 'Failed to send email.' })
	}
})

export default authRouter
