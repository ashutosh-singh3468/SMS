import {
  createAppointment,
  listAppointmentsByPatient,
  cancelAppointment,
} from '../models/appointmentModel.js';

export async function bookAppointment(req, res) {
  const { doctorId, appointmentDate, appointmentTime, symptoms } = req.body;

  if (!doctorId || !appointmentDate || !appointmentTime || !symptoms) {
    return res.status(400).json({
      message: 'doctorId, appointmentDate, appointmentTime and symptoms are required',
    });
  }

  const appointment = await createAppointment({
    patientId: Number(req.user.sub),
    doctorId: Number(doctorId),
    appointmentDate,
    appointmentTime,
    symptoms,
  });

  return res.status(201).json({ message: 'Appointment booked', appointment });
}

export async function getMyAppointments(req, res) {
  const appointments = await listAppointmentsByPatient(Number(req.user.sub));
  return res.status(200).json({ appointments });
}

export async function cancelMyAppointment(req, res) {
  const appointmentId = Number(req.params.id);
  const appointment = await cancelAppointment(Number(req.user.sub), appointmentId);

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  return res.status(200).json({ message: 'Appointment cancelled', appointment });
}
