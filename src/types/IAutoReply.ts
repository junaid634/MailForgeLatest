import { ObjectId } from 'mongoose'

export interface IAutoReply {
	userId: ObjectId
	isEnabled: boolean
	subject: string
	message: string
	startDate?: Date
	endDate?: Date
	createdAt: Date
	updatedAt: Date
}
