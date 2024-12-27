import mongoose from 'mongoose'
import { DatabaseConfig } from '../types/config'
import environment from './environments'

export const createDatabaseConfig = (): DatabaseConfig => ({
	uri: environment.MONGODB_URI,
	options: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
})

export const connectDB = async (): Promise<void> => {
	try {
		const config = createDatabaseConfig()
		const c = await mongoose.connect(config.uri)
		console.log(`MongoDB connected successfully at ${c.connection.host}`)
	} catch (error) {
		console.error('MongoDB connection error:', error)
		process.exit(1)
	}
}

export default connectDB
