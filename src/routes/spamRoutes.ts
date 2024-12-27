import { Router } from 'express';
import { query } from 'express-validator';
import auth from '../middleware/auth';
import validate from '../middleware/validate';
import spamController from '../controllers/spamController';

const router = Router();

router.use(auth);

router.get(
  '/',
  [
    query('folder').default('INBOX'),
    query('limit').isInt({ min: 1, max: 100 }).default(50),
    validate
  ],
  spamController.getSpamEmails
);

export default router;