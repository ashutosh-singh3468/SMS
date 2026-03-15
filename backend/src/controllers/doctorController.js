import { listDoctors } from '../models/doctorModel.js';

export async function getDoctors(req, res) {
  const { search = '', department = '' } = req.query;
  const doctors = await listDoctors({ search, department });
  return res.status(200).json({ doctors });
}
