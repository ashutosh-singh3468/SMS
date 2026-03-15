import cors from 'cors';
import express from 'express';

import path from 'path';
import { fileURLToPath } from 'url';

 main
import { env } from './config/env.js';
import { db } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.resolve(__dirname, '../../frontend');

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());
app.use(express.static(staticDir));


app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());
 main

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', dbMode: db.mode });
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);


app.get('*', (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});


 main
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
