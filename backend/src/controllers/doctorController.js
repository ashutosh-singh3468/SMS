import { listDoctors, updateDoctorSlots } from '../models/doctorModel.js';

export async function getDoctors(req, res) {
  const { search = '', department = '' } = req.query;
  const doctors = await listDoctors({ search, department });
  return res.status(200).json({ doctors });
}

export async function updateSlots(req, res) {
  const { doctorId, availableSlots } = req.body;

  if (!doctorId || !Array.isArray(availableSlots)) {
    return res.status(400).json({ message: 'doctorId and availableSlots[] are required' });
  }

  const doctor = await updateDoctorSlots(Number(doctorId), availableSlots);
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  return res.status(200).json({ message: 'Availability updated', doctor });
}
