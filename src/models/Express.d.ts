import { IUser } from '../types'

declare global {
	namespace Express {
		interface Request {
			user?: IUser // Replace `any` with the specific type of `user` if known.
		}
	}
}
