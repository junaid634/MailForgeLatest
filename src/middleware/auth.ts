import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const auth = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '')
		if (!token) {
			throw new Error()
		}
		console.log(process.env.JWT_SECRET)

		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			userId: string
		}
		const user = await User.findById(decoded.userId)

		if (!user) {
			throw new Error()
		}

		req.user = user
		next()
	} catch (error) {
		res.status(401).json({
			success: false,
			error: 'Please authenticate',
		})
	}
}

export default auth
