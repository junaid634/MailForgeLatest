// Add to existing types
export interface EmailConfig {
	smtp: {
		host: string
		port: number
		secure: boolean
		user: string
		pass: string
	}
	imap: {
		host: string
		port: number
		user: string
		pass: string
		tls: boolean
	}
}

export interface IUser {
	_id: string
	email: string
	password: string
	emailConfig?: EmailConfig
	comparePassword(candidatePassword: string): Promise<boolean>
}

export interface EmailData {
	to: string
	subject: string
	text?: string
	html?: string
	emailConfigId?: string
}

export interface EmailResponse {
	success: boolean
	messageId?: string
	error?: string
}

export interface ReceivedEmail {
	id: string
	subject: string
	from: string
	date: Date
	text?: string
	html?: string
	headerLines: any
}

export interface GetEmailsResponse {
	success: boolean
	emails?: ReceivedEmail[]
	error?: string
}

export interface EmailConfigWithName extends EmailConfig {
	id: string
	name: string
	isDefault: boolean
}

// Update IUser interface
export interface IUser {
	_id: string
	email: string
	password: string
	emailConfigs: EmailConfigWithName[]
	comparePassword(candidatePassword: string): Promise<boolean>
}

export interface ScheduleEmailData extends EmailData {
	scheduledTime: string // ISO string
	emailConfigId?: string // Optional - uses default if not specified
}
