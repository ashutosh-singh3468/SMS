import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { db } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', dbMode: db.mode });
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
