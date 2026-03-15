CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Patient',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_token TEXT
);

CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  specialization TEXT NOT NULL,
  available_slots TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending'
);
