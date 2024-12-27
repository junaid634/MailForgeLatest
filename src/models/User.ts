import bcrypt from 'bcryptjs'
import mongoose, { Schema } from 'mongoose'
import { IUser } from '../types'

const emailConfigSchema = new Schema(
	{
		id: {
			type: String,
			required: true,
			default: () => crypto.randomUUID(),
		},
		name: {
			type: String,
			required: true,
		},
		isDefault: {
			type: Boolean,
			default: false,
		},
		smtp: {
			host: String,
			port: Number,
			secure: Boolean,
			user: String,
			pass: String,
		},
		imap: {
			host: String,
			port: Number,
			user: String,
			pass: String,
			tls: Boolean,
		},
	},
	{ _id: false }
)

const userSchema = new Schema<IUser>(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
		},
		emailConfigs: [emailConfigSchema],
	},
	{ timestamps: true }
)

// Ensure only one default config
userSchema.pre('save', async function (next) {
	if (this.isModified('emailConfigs')) {
		const defaultConfigs = this.emailConfigs.filter(
			(config) => config.isDefault
		)
		if (defaultConfigs.length > 1) {
			throw new Error('Only one default email configuration allowed')
		}
	}
	next()
})

// Hash password before saving
userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 10)
	}
	next()
})

userSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model<IUser>('User', userSchema)
