import { db, pool } from '../config/db.js';


const validStatuses = new Set(['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed', 'Reschedule Requested']);

export async function createAppointment(payload) {
  if (db.mode === 'memory') {
    const created = {
      id: db.memory.appointments.length + 1,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      ...payload,
    };

export async function createAppointment(payload) {
  if (db.mode === 'memory') {
    const created = { id: db.memory.appointments.length + 1, status: 'Pending', ...payload };
 main
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


export async function listAppointmentsByDoctor(doctorId) {
  if (db.mode === 'memory') {
    return db.memory.appointments
      .filter((appointment) => appointment.doctorId === doctorId)
      .sort((a, b) => `${a.appointmentDate} ${a.appointmentTime}`.localeCompare(`${b.appointmentDate} ${b.appointmentTime}`));
  }

  const query = `
    SELECT a.id, a.patient_id AS "patientId", a.doctor_id AS "doctorId", a.appointment_date AS "appointmentDate",
      a.appointment_time AS "appointmentTime", a.symptoms, a.status, u.name AS "patientName"
    FROM appointments a
    LEFT JOIN users u ON u.id = a.patient_id
    WHERE a.doctor_id = $1
    ORDER BY a.appointment_date, a.appointment_time;
  `;
  const { rows } = await pool.query(query, [doctorId]);
  return rows;
}

 main
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


export async function updateAppointmentStatus(appointmentId, doctorId, status) {
  if (!validStatuses.has(status)) {
    return null;
  }

  if (db.mode === 'memory') {
    const index = db.memory.appointments.findIndex(
      (appointment) => appointment.id === appointmentId && appointment.doctorId === doctorId,
    );
    if (index === -1) {
      return null;
    }
    db.memory.appointments[index] = { ...db.memory.appointments[index], status };
    return db.memory.appointments[index];
  }

  const query = `
    UPDATE appointments
    SET status = $1
    WHERE id = $2 AND doctor_id = $3
    RETURNING id, patient_id AS "patientId", doctor_id AS "doctorId", appointment_date AS "appointmentDate",
      appointment_time AS "appointmentTime", symptoms, status;
  `;
  const { rows } = await pool.query(query, [status, appointmentId, doctorId]);
  return rows[0] || null;
}

export async function getOverviewStats() {
  if (db.mode === 'memory') {
    return {
      totalAppointments: db.memory.appointments.length,
      totalPatients: db.memory.users.filter((user) => user.role === 'Patient').length,
      totalDoctors: db.memory.doctors.length,
      pendingAppointments: db.memory.appointments.filter((item) => item.status === 'Pending').length,
    };
  }

  const [appointments, patients, doctors, pending] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM appointments'),
    pool.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'Patient'"),
    pool.query('SELECT COUNT(*)::int AS count FROM doctors'),
    pool.query("SELECT COUNT(*)::int AS count FROM appointments WHERE status = 'Pending'"),
  ]);

  return {
    totalAppointments: appointments.rows[0].count,
    totalPatients: patients.rows[0].count,
    totalDoctors: doctors.rows[0].count,
    pendingAppointments: pending.rows[0].count,
  };
}
 main
