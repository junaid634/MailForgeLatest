import { google } from 'googleapis'
import environment from '../config/environments'

const CLIENT_ID = environment.CLIENT_ID
const CLIENT_SECRET = environment.CLIENT_SECRET
const REDIRECT_URI = environment.REDIRECT_URI
export const oAuth2Client = new google.auth.OAuth2(
	CLIENT_ID,
	CLIENT_SECRET,
	REDIRECT_URI
)

export const googleAthUrl = () => {
	console.log('this is me')

	const url = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: [
			'https://www.googleapis.com/auth/gmail.readonly',
			'https://www.googleapis.com/auth/gmail.send',
		],
	})
	return url
}
