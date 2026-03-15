import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = env.dbUrl
  ? new Pool({ connectionString: env.dbUrl })
  : null;

const memory = {
  users: [],
  doctors: [
    { id: 1, name: 'Dr. Priya Sharma', department: 'Cardiology', specialization: 'Heart Failure', availableSlots: ['10:00', '11:00', '15:00'] },
    { id: 2, name: 'Dr. Aman Verma', department: 'Dermatology', specialization: 'Skin Allergy', availableSlots: ['09:30', '13:00', '16:00'] },
    { id: 3, name: 'Dr. Kavya Joshi', department: 'Neurology', specialization: 'Migraine', availableSlots: ['10:30', '12:30', '17:00'] },
  ],
  appointments: [],
};

export const db = {
  mode: pool ? 'postgres' : 'memory',
  memory,
};
