import mongoose, { Schema } from 'mongoose'
import { IAutoReply } from '../types/IAutoReply.js'

const autoReplySchema = new Schema<IAutoReply>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		isEnabled: {
			type: Boolean,
			default: false,
		},
		subject: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		startDate: {
			type: Date,
		},
		endDate: {
			type: Date,
		},
	},
	{ timestamps: true }
)

export default mongoose.model<IAutoReply>('AutoReply', autoReplySchema)
