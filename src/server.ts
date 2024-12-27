import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import connectDB from './config/database'
import environment from './config/environments'
import errorHandler from './middleware/errorHandler'
import routes from './routes'

dotenv.config()

const app = express()
const PORT = environment.PORT

// Connect to MongoDB

app.use(cors())
app.use(express.json())

// Routes
app.use('/api', routes)

// Error handling
app.use(errorHandler)
connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`)
		})
	})
	.catch((err) => {
		console.error('Failed to connect to database', err)
		process.exit(1)
	})

export default app
