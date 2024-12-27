import { IUser } from '../types'
import { Schedule, ScheduledEmail } from '../types/scheduler'
import emailService from './emailService'

export class SchedulerService {
	private schedules: Map<string, Schedule> = new Map()

	constructor() {
		this.startScheduler()
	}

	async scheduleEmail(user: IUser, email: ScheduledEmail): Promise<string> {
		const scheduleId = crypto.randomUUID()
		const schedule: Schedule = {
			id: scheduleId,
			userId: user._id,
			email,
			status: 'pending',
		}

		this.schedules.set(scheduleId, schedule)
		return scheduleId
	}

	private async startScheduler(): Promise<void> {
		setInterval(() => this.processSchedules(), 60000) // Check every minute
	}

	private async processSchedules(): Promise<void> {
		const now = new Date()
		for (const [id, schedule] of this.schedules) {
			if (
				schedule.status === 'pending' &&
				new Date(schedule.email.sendAt) <= now
			) {
				await this.processSchedule(schedule)
			}
		}
	}

	private async processSchedule(schedule: Schedule): Promise<void> {
		try {
			const user = await this.getUserById(schedule.userId)
			if (!user) return

			await emailService.sendEmail(user, {
				to: schedule.email.to,
				subject: schedule.email.subject,
				text: schedule.email.text,
				html: schedule.email.html,
			})

			schedule.status = 'completed'
		} catch (error) {
			schedule.status = 'failed'
			schedule.error = error instanceof Error ? error.message : 'Unknown error'
		}
	}

	private async getUserById(userId: string): Promise<IUser | null> {
		// Implement user retrieval logic
		return null
	}
	public async getScheduledEmails(user: IUser) {
		const scheduledEmails = []
		for (const [id, schedule] of this.schedules) {
			if (schedule.userId === user._id) {
				scheduledEmails.push(schedule.email)
			}
		}
		return scheduledEmails
	}
	public async cancelSchedule(emailId: string) {
		this.schedules.delete(emailId)
	}
}

export default new SchedulerService()
