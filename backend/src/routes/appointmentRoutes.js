import { Router } from 'express';
import {
  bookAppointment,
  cancelMyAppointment,
  getMyAppointments,
} from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.get('/mine', getMyAppointments);
router.post('/', bookAppointment);
router.patch('/:id/cancel', cancelMyAppointment);

export default router;
