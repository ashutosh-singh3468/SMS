import { Router } from 'express';

import { getDoctors, updateSlots } from '../controllers/doctorController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

import { getDoctors } from '../controllers/doctorController.js';
 main

const router = Router();

router.get('/', getDoctors);

router.patch('/slots', authenticate, authorize('Doctor', 'Admin'), updateSlots);
 main

export default router;
