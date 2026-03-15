import { Router } from 'express';
import { login, register, verifyEmail } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);

export default router;
