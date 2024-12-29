import mongoose, { Schema } from 'mongoose'
import { ISchedule } from '../types/scheduler'

const ScheduleSchema: Schema = new Schema<ISchedule>(
	{
		id: { type: String, required: true, unique: true },
		userId: { type: String, required: true },
		email: {
			to: { type: String, required: true },
			subject: { type: String, required: true },
			text: { type: String },
			html: { type: String },
			sendAt: { type: Date, required: true },
		},
		status: {
			type: String,
			enum: ['pending', 'completed', 'failed'],
			default: 'pending',
		},
		error: { type: String },
	},
	{ timestamps: true }
)

export const ScheduleModel = mongoose.model<ISchedule>(
	'Schedule',
	ScheduleSchema
)
