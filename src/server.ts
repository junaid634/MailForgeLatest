import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import connectDB from './config/database'
import environment from './config/environments'
import errorHandler from './middleware/errorHandler'
import routes from './routes'
import authRouter from './routes/authRoutes'

dotenv.config()

const app = express()
const PORT = environment.PORT

// Connect to MongoDB

app.use(cors())
app.use(express.json())
app.get('/', (_, res) => {
	res.send('Hallo Junaid')
})
// Routes
app.use('/api/v1', routes)
app.use('/auth', authRouter)

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
