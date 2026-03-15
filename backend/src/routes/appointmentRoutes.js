import { Router } from 'express';
import {
  bookAppointment,
  cancelMyAppointment,
  getAdminOverview,
  getDoctorAppointments,
  getMyAppointments,
  getNotifications,
  getProfile,
  updateDoctorAppointmentStatus,
} from '../controllers/appointmentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.get('/mine', authorize('Patient'), getMyAppointments);
router.post('/', authorize('Patient'), bookAppointment);
router.patch('/:id/cancel', authorize('Patient'), cancelMyAppointment);
router.get('/doctor', authorize('Doctor', 'Admin'), getDoctorAppointments);
router.patch('/:id/status', authorize('Doctor', 'Admin'), updateDoctorAppointmentStatus);
router.get('/notifications', authorize('Patient'), getNotifications);
router.get('/admin/overview', authorize('Admin'), getAdminOverview);
router.get('/profile', getProfile);

export default router;
