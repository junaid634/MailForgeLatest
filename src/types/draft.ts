// Add this to your existing types/index.ts
import { Document, ObjectId } from 'mongoose'

export interface IDraft extends Document {
	userId: ObjectId
	to: string
	subject?: string
	text?: string
	html?: string
	createdAt: Date
	lastModified: Date
}

// Add this to your existing EmailService interface
export interface DraftEmailResponse {
	success: boolean
	draft?: IDraft
	error?: string
}
