export interface ScheduledEmail {
	to: string
	subject: string
	text?: string
	html?: string
	sendAt: Date
	recurring?: {
		frequency: 'daily' | 'weekly' | 'monthly'
		endDate?: Date
	}
	emailConfigId?: string
}

export interface Schedule {
	id: string
	userId: string
	email: ScheduledEmail
	status: 'pending' | 'completed' | 'failed'
	error?: string
}