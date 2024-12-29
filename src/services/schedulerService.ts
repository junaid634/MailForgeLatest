import crypto from 'crypto'
import { ScheduleModel } from '../models/Schedule'
import User from '../models/User'
import { IUser } from '../types'
import { ISchedule } from '../types/scheduler'
import emailService from './emailService'

export class SchedulerService {
	constructor() {
		this.startScheduler()
	}

	async scheduleEmail(user: IUser, email: ISchedule['email']): Promise<string> {
		const scheduleId = crypto.randomUUID()

		const schedule = new ScheduleModel({
			id: scheduleId,
			userId: user._id,
			email,
			status: 'pending',
		})

		await schedule.save()
		return scheduleId
	}

	private async startScheduler(): Promise<void> {
		setInterval(() => this.processSchedules(), 60000) // Check every minute
	}

	private async processSchedules(): Promise<void> {
		const now = new Date()
		console.log('scheduler is running')

		// Find pending schedules whose sendAt time is due
		const schedules = await ScheduleModel.find({
			status: 'pending',
			'email.sendAt': { $lte: now },
		})

		for (const schedule of schedules) {
			await this.processSchedule(schedule)
		}
	}

	private async processSchedule(schedule: ISchedule): Promise<void> {
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
			await schedule.save()
		} catch (error) {
			schedule.status = 'failed'
			schedule.error = error instanceof Error ? error.message : 'Unknown error'
			await schedule.save()
		}
	}

	private async getUserById(userId: string): Promise<IUser | null> {
		const user = await User.findById(userId).lean()
		if (!user) {
			throw new Error(`User ${userId} not found`)
		}
		return user
	}

	public async getScheduledEmails(user: IUser) {
		return await ScheduleModel.find({ userId: user._id })
	}

	public async cancelSchedule(emailId: string) {
		await ScheduleModel.findOneAndDelete({ id: emailId })
	}
}

export default new SchedulerService()
