import { db, pool } from '../config/db.js';

export async function createAppointment(payload) {
  if (db.mode === 'memory') {
    const created = { id: db.memory.appointments.length + 1, status: 'Pending', ...payload };
    db.memory.appointments.push(created);
    return created;
  }

  const query = `
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, symptoms, status)
    VALUES ($1, $2, $3, $4, $5, 'Pending')
    RETURNING id, patient_id AS "patientId", doctor_id AS "doctorId", appointment_date AS "appointmentDate",
      appointment_time AS "appointmentTime", symptoms, status;
  `;
  const values = [payload.patientId, payload.doctorId, payload.appointmentDate, payload.appointmentTime, payload.symptoms];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function listAppointmentsByPatient(patientId) {
  if (db.mode === 'memory') {
    return db.memory.appointments.filter((appointment) => appointment.patientId === patientId);
  }

  const query = `
    SELECT a.id, a.patient_id AS "patientId", a.doctor_id AS "doctorId", a.appointment_date AS "appointmentDate",
      a.appointment_time AS "appointmentTime", a.symptoms, a.status, d.name AS "doctorName"
    FROM appointments a
    LEFT JOIN doctors d ON d.id = a.doctor_id
    WHERE a.patient_id = $1
    ORDER BY a.appointment_date DESC, a.appointment_time DESC;
  `;
  const { rows } = await pool.query(query, [patientId]);
  return rows;
}

export async function cancelAppointment(patientId, appointmentId) {
  if (db.mode === 'memory') {
    const index = db.memory.appointments.findIndex(
      (appointment) => appointment.id === appointmentId && appointment.patientId === patientId,
    );
    if (index === -1) {
      return null;
    }
    db.memory.appointments[index] = { ...db.memory.appointments[index], status: 'Cancelled' };
    return db.memory.appointments[index];
  }

  const query = `
    UPDATE appointments
    SET status = 'Cancelled'
    WHERE id = $1 AND patient_id = $2
    RETURNING id, patient_id AS "patientId", doctor_id AS "doctorId", appointment_date AS "appointmentDate",
      appointment_time AS "appointmentTime", symptoms, status;
  `;
  const { rows } = await pool.query(query, [appointmentId, patientId]);
  return rows[0] || null;
}
