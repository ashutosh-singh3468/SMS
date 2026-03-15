import {
  createAppointment,

  listAppointmentsByDoctor,
  listAppointmentsByPatient,
  cancelAppointment,
  updateAppointmentStatus,
  getOverviewStats,
} from '../models/appointmentModel.js';
import { findUserById } from '../models/userModel.js';

  listAppointmentsByPatient,
  cancelAppointment,
} from '../models/appointmentModel.js';
 main

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


export async function getDoctorAppointments(req, res) {
  const doctorId = Number(req.query.doctorId || req.user.sub);
  const appointments = await listAppointmentsByDoctor(doctorId);
  return res.status(200).json({ appointments });
}

export async function updateDoctorAppointmentStatus(req, res) {
  const appointmentId = Number(req.params.id);
  const { status, doctorId } = req.body;
  const resolvedDoctorId = Number(doctorId || req.user.sub);

  if (!status) {
    return res.status(400).json({ message: 'status is required' });
  }

  const appointment = await updateAppointmentStatus(appointmentId, resolvedDoctorId, status);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found or invalid status' });
  }

  return res.status(200).json({ message: 'Appointment updated', appointment });
}

export async function getNotifications(req, res) {
  const patientId = Number(req.user.sub);
  const appointments = await listAppointmentsByPatient(patientId);
  const notifications = appointments
    .filter((item) => item.status !== 'Pending')
    .map((item) => ({
      id: `notif-${item.id}`,
      message: `Appointment #${item.id} is now ${item.status}`,
      status: item.status,
      appointmentId: item.id,
    }));

  return res.status(200).json({ notifications });
}

export async function getAdminOverview(_req, res) {
  const stats = await getOverviewStats();
  return res.status(200).json({ stats });
}

export async function getProfile(req, res) {
  const user = await findUserById(Number(req.user.sub));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
}

 main
