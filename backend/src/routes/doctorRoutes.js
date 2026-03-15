import { Router } from 'express';
import { getDoctors } from '../controllers/doctorController.js';

const router = Router();

router.get('/', getDoctors);

export default router;
