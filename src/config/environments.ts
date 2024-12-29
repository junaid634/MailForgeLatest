import dotenv from 'dotenv'

dotenv.config()
const environment = {
	MONGODB_URI: process.env.MONGODB_URI ?? '',
	PORT: process.env.PORT || 3000,
	JWT_SECRET: process.env.JWT_SECRET || '',
	JWT_SECRET_EXPIRES: process.env.JWT_SECRET_EXPIRES || '',
	CLIENT_ID: process.env.CLIENT_ID || '',
	CLIENT_SECRET: process.env.CLIENT_SECRET || '',
	REDIRECT_URI: process.env.REDIRECT_URI || '',
}
export default environment
