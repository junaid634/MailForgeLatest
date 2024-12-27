import { Router } from 'express';
import emailRoutes from './emailRoutes';
import userRoutes from './userRoutes';
import spamRoutes from './spamRoutes';

const router = Router();

router.use('/emails', emailRoutes);
router.use('/users', userRoutes);
router.use('/spam', spamRoutes);

export default router;