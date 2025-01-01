import mongoose, { Schema } from 'mongoose'
import { IDraft } from '../types/draft.js'

const draftSchema = new Schema<IDraft>({
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	to: {
		type: String,
		required: true,
	},
	subject: String,
	text: String,
	html: String,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	lastModified: {
		type: Date,
		default: Date.now,
	},
})

draftSchema.pre('save', function (next) {
	this.lastModified = new Date()
	next()
})

export default mongoose.model<IDraft>('Draft', draftSchema)
