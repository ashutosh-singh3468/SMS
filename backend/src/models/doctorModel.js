import { db, pool } from '../config/db.js';

export async function listDoctors({ search = '', department = '' }) {
  if (db.mode === 'memory') {
    return db.memory.doctors.filter((doctor) => {
      const matchesSearch = search
        ? `${doctor.name} ${doctor.specialization}`.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesDepartment = department
        ? doctor.department.toLowerCase() === department.toLowerCase()
        : true;
      return matchesSearch && matchesDepartment;
    });
  }

  const query = `
    SELECT id, name, department, specialization, available_slots AS "availableSlots"
    FROM doctors
    WHERE ($1 = '' OR LOWER(name || ' ' || specialization) LIKE LOWER('%' || $1 || '%'))
      AND ($2 = '' OR LOWER(department) = LOWER($2));
  `;
  const { rows } = await pool.query(query, [search, department]);
  return rows;
}


export async function updateDoctorSlots(doctorId, availableSlots) {
  if (db.mode === 'memory') {
    const index = db.memory.doctors.findIndex((doctor) => doctor.id === doctorId);
    if (index === -1) {
      return null;
    }
    db.memory.doctors[index] = {
      ...db.memory.doctors[index],
      availableSlots,
    };
    return db.memory.doctors[index];
  }

  const query = `
    UPDATE doctors
    SET available_slots = $1
    WHERE id = $2
    RETURNING id, name, department, specialization, available_slots AS "availableSlots";
  `;
  const { rows } = await pool.query(query, [availableSlots, doctorId]);
  return rows[0] || null;
}
 main
