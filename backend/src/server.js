
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '../../frontend');
const port = Number(process.env.PORT || 4000);
const tokenSecret = process.env.TOKEN_SECRET || 'carepulse-local-secret';

const db = {
  users: [
    {
      id: 1,
      name: 'Dr. Priya Sharma',
      email: 'doctor1@carepulse.com',
      passwordHash: hashPassword('doctor123'),
      role: 'Doctor',
      phone: '+91 90000 00001',
      age: 38,
      gender: 'Female',
      bloodGroup: 'O+',
      department: 'Cardiology',
      specialization: 'Heart Failure',
      bio: 'Senior cardiologist with 10+ years of clinical practice.',
    },
    {
      id: 2,
      name: 'Admin User',
      email: 'admin@carepulse.com',
      passwordHash: hashPassword('admin123'),
      role: 'Admin',
      phone: '+91 90000 00999',
      age: 34,
      gender: 'Male',
      bloodGroup: 'B+',
      bio: 'Operations and quality management for Care Pulse.',
    },
  ],
  doctors: [
    { id: 1, name: 'Dr. Priya Sharma', department: 'Cardiology', specialization: 'Heart Failure', experience: '10 Years', rating: 4.8, availableSlots: ['10:00', '11:00', '15:00'] },
    { id: 3, name: 'Dr. Aman Verma', department: 'Dermatology', specialization: 'Skin Allergy', experience: '7 Years', rating: 4.6, availableSlots: ['09:30', '13:00', '16:00'] },
    { id: 4, name: 'Dr. Kavya Joshi', department: 'Neurology', specialization: 'Migraine', experience: '9 Years', rating: 4.7, availableSlots: ['10:30', '12:30', '17:00'] },
  ],
  appointments: [
    { id: 1, patientId: 5, doctorId: 1, appointmentDate: '2026-04-10', appointmentTime: '10:00', symptoms: 'Chest discomfort', status: 'Pending', notes: '', type: 'New' },
  ],
  notifications: [],
};

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function signToken(payload) {
  const base = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', tokenSecret).update(base).digest('base64url');
  return `${base}.${sig}`;
}

function verifyToken(token) {
  const [base, sig] = token.split('.');
  if (!base || !sig) return null;
  const expected = crypto.createHmac('sha256', tokenSecret).update(base).digest('base64url');
  if (expected !== sig) return null;
  try {
    return JSON.parse(Buffer.from(base, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

function json(res, code, payload) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function getAuthUser(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  return verifyToken(auth.slice(7));
}

function requireRole(req, res, roles) {
  const user = getAuthUser(req);
  if (!user) {
    json(res, 401, { message: 'Unauthorized' });
    return null;
  }
  if (!roles.includes(user.role)) {
    json(res, 403, { message: 'Forbidden' });
    return null;
  }
  return user;
}

function serveStatic(res, pathname) {
  let filePath = path.join(frontendDir, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(frontendDir)) {
    res.writeHead(400);
    res.end('Bad path');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(frontendDir, 'index.html');
  }

  const ext = path.extname(filePath);
  const mime = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
  }[ext] || 'text/plain';

  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
}

function createNotification(userId, message, type = 'info') {
  db.notifications.push({
    id: db.notifications.length + 1,
    userId,
    message,
    type,
    createdAt: new Date().toISOString(),
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname, searchParams } = url;

  if (req.method === 'GET' && pathname === '/health') {
    return json(res, 200, { status: 'ok', mode: 'memory', version: 'professional-static-2.0' });
  }

  if (req.method === 'POST' && pathname === '/api/auth/register') {
    const body = await parseBody(req);
    const { name, email, password, role = 'Patient', phone = '', age = 0, gender = '', bloodGroup = '' } = body;
    if (!name || !email || !password) return json(res, 400, { message: 'name, email and password are required' });
    if (db.users.some((u) => u.email === email)) return json(res, 409, { message: 'Email already registered' });

    const user = {
      id: db.users.length + 1,
      name,
      email,
      passwordHash: hashPassword(password),
      role,
      phone,
      age: Number(age) || 0,
      gender,
      bloodGroup,
      bio: role === 'Doctor' ? 'Doctor profile - update from dashboard.' : 'Patient profile - update from dashboard.',
      department: body.department || '',
      specialization: body.specialization || '',
    };
    db.users.push(user);

    if (role === 'Doctor') {
      db.doctors.push({
        id: user.id,
        name: user.name,
        department: user.department || 'General Medicine',
        specialization: user.specialization || 'General Physician',
        experience: body.experience || '2 Years',
        rating: 4.5,
        availableSlots: ['09:00', '11:00', '14:00'],
      });
    }

    return json(res, 201, {
      message: 'Registration successful. You can login now.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const body = await parseBody(req);
    const { email, password } = body;
    const user = db.users.find((u) => u.email === email);
    if (!user || user.passwordHash !== hashPassword(password)) return json(res, 401, { message: 'Invalid credentials' });

    const token = signToken({ sub: user.id, role: user.role, name: user.name, email: user.email });
    return json(res, 200, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        bio: user.bio,
      },
    });
  }

  if (req.method === 'GET' && pathname === '/api/profile') {
    const auth = requireRole(req, res, ['Patient', 'Doctor', 'Admin']);
    if (!auth) return;
    const user = db.users.find((u) => u.id === Number(auth.sub));
    return json(res, 200, { profile: { ...user, passwordHash: undefined } });
  }

  if (req.method === 'PATCH' && pathname === '/api/profile') {
    const auth = requireRole(req, res, ['Patient', 'Doctor', 'Admin']);
    if (!auth) return;
    const body = await parseBody(req);
    const user = db.users.find((u) => u.id === Number(auth.sub));
    if (!user) return json(res, 404, { message: 'User not found' });

    const updatable = ['name', 'phone', 'age', 'gender', 'bloodGroup', 'bio'];
    updatable.forEach((field) => {
      if (body[field] !== undefined) user[field] = field === 'age' ? Number(body[field]) || 0 : body[field];
    });

    if (user.role === 'Doctor') {
      const doctor = db.doctors.find((d) => d.id === user.id);
      if (doctor && body.name) doctor.name = body.name;
    }

    return json(res, 200, { message: 'Profile updated', profile: { ...user, passwordHash: undefined } });
  }

  if (req.method === 'GET' && pathname === '/api/doctors') {
    const search = (searchParams.get('search') || '').toLowerCase();
    const department = (searchParams.get('department') || '').toLowerCase();

    const doctors = db.doctors.filter((d) => {
      const hitSearch = !search || `${d.name} ${d.specialization}`.toLowerCase().includes(search);
      const hitDept = !department || d.department.toLowerCase().includes(department);
      return hitSearch && hitDept;
    });

    return json(res, 200, { doctors });
  }

  if (req.method === 'PATCH' && pathname === '/api/doctors/slots') {
    const auth = requireRole(req, res, ['Doctor', 'Admin']);
    if (!auth) return;
    const body = await parseBody(req);
    const doctorId = auth.role === 'Doctor' ? Number(auth.sub) : Number(body.doctorId);
    const doctor = db.doctors.find((d) => d.id === doctorId);
    if (!doctor) return json(res, 404, { message: 'Doctor not found' });

    if (Array.isArray(body.availableSlots)) doctor.availableSlots = body.availableSlots;
    return json(res, 200, { message: 'Availability updated', doctor });
  }

  if (req.method === 'POST' && pathname === '/api/appointments') {
    const auth = requireRole(req, res, ['Patient']);
    if (!auth) return;
    const body = await parseBody(req);
    const { doctorId, appointmentDate, appointmentTime, symptoms, type = 'New' } = body;
    if (!doctorId || !appointmentDate || !appointmentTime || !symptoms) {
      return json(res, 400, { message: 'doctorId, appointmentDate, appointmentTime and symptoms are required' });
    }

    const doctor = db.doctors.find((d) => d.id === Number(doctorId));
    if (!doctor) return json(res, 404, { message: 'Doctor not found' });

    const appointment = {
      id: db.appointments.length + 1,
      patientId: Number(auth.sub),
      doctorId: Number(doctorId),
      appointmentDate,
      appointmentTime,
      symptoms,
      type,
      status: 'Pending',
      notes: '',
      createdAt: new Date().toISOString(),
    };
    db.appointments.push(appointment);

    createNotification(Number(auth.sub), `Appointment #${appointment.id} booked successfully.`, 'success');
    createNotification(Number(doctor.id), `New appointment #${appointment.id} assigned.`, 'info');

    return json(res, 201, { message: 'Appointment booked', appointment });
  }

  if (req.method === 'GET' && pathname === '/api/appointments/mine') {
    const auth = requireRole(req, res, ['Patient']);
    if (!auth) return;
    const appointments = db.appointments
      .filter((a) => a.patientId === Number(auth.sub))
      .map((a) => ({ ...a, doctorName: db.doctors.find((d) => d.id === a.doctorId)?.name || 'Unknown' }));
    return json(res, 200, { appointments });
  }

  if (req.method === 'GET' && pathname === '/api/appointments/history') {
    const auth = requireRole(req, res, ['Patient']);
    if (!auth) return;
    const history = db.appointments.filter((a) => a.patientId === Number(auth.sub) && ['Completed', 'Cancelled', 'Rejected'].includes(a.status));
    return json(res, 200, { history });
  }

  if (req.method === 'PATCH' && /^\/api\/appointments\/\d+\/cancel$/.test(pathname)) {
    const auth = requireRole(req, res, ['Patient']);
    if (!auth) return;
    const appointmentId = Number(pathname.split('/')[3]);
    const appt = db.appointments.find((a) => a.id === appointmentId && a.patientId === Number(auth.sub));
    if (!appt) return json(res, 404, { message: 'Appointment not found' });

    appt.status = 'Cancelled';
    createNotification(Number(auth.sub), `Appointment #${appt.id} cancelled.`, 'warning');
    createNotification(Number(appt.doctorId), `Appointment #${appt.id} has been cancelled by patient.`, 'warning');
    return json(res, 200, { message: 'Appointment cancelled', appointment: appt });
  }

  if (req.method === 'GET' && pathname === '/api/appointments/doctor') {
    const auth = requireRole(req, res, ['Doctor', 'Admin']);
    if (!auth) return;
    const doctorId = Number(searchParams.get('doctorId') || auth.sub);
    const appointments = db.appointments
      .filter((a) => a.doctorId === doctorId)
      .map((a) => ({ ...a, patientName: db.users.find((u) => u.id === a.patientId)?.name || `Patient #${a.patientId}` }));

    return json(res, 200, { appointments });
  }

  if (req.method === 'PATCH' && /^\/api\/appointments\/\d+\/status$/.test(pathname)) {
    const auth = requireRole(req, res, ['Doctor', 'Admin']);
    if (!auth) return;
    const appointmentId = Number(pathname.split('/')[3]);
    const body = await parseBody(req);
    const allowed = new Set(['Approved', 'Rejected', 'Completed', 'Reschedule Requested']);
    if (!allowed.has(body.status)) return json(res, 400, { message: 'Invalid status' });

    const appt = db.appointments.find((a) => a.id === appointmentId);
    if (!appt) return json(res, 404, { message: 'Appointment not found' });
    if (auth.role === 'Doctor' && appt.doctorId !== Number(auth.sub)) return json(res, 403, { message: 'Forbidden' });

    appt.status = body.status;
    if (body.notes) appt.notes = body.notes;

    createNotification(Number(appt.patientId), `Appointment #${appt.id} updated to ${appt.status}.`, 'info');
    return json(res, 200, { message: 'Appointment status updated', appointment: appt });
  }

  if (req.method === 'GET' && pathname === '/api/notifications') {
    const auth = requireRole(req, res, ['Patient', 'Doctor', 'Admin']);
    if (!auth) return;
    const notifications = db.notifications.filter((n) => n.userId === Number(auth.sub)).slice(-15).reverse();
    return json(res, 200, { notifications });
  }

  if (req.method === 'GET' && pathname === '/api/dashboard/stats') {
    const auth = requireRole(req, res, ['Patient', 'Doctor', 'Admin']);
    if (!auth) return;

    if (auth.role === 'Patient') {
      const mine = db.appointments.filter((a) => a.patientId === Number(auth.sub));
      return json(res, 200, {
        stats: {
          total: mine.length,
          pending: mine.filter((a) => a.status === 'Pending').length,
          approved: mine.filter((a) => a.status === 'Approved').length,
          completed: mine.filter((a) => a.status === 'Completed').length,
        },
      });
    }

    if (auth.role === 'Doctor') {
      const mine = db.appointments.filter((a) => a.doctorId === Number(auth.sub));
      return json(res, 200, {
        stats: {
          todaysSchedule: mine.filter((a) => a.appointmentDate === new Date().toISOString().slice(0, 10)).length,
          totalCases: mine.length,
          pending: mine.filter((a) => a.status === 'Pending').length,
          completed: mine.filter((a) => a.status === 'Completed').length,
        },
      });
    }

    return json(res, 200, {
      stats: {
        totalUsers: db.users.length,
        totalDoctors: db.doctors.length,
        totalAppointments: db.appointments.length,
        pendingAppointments: db.appointments.filter((a) => a.status === 'Pending').length,
      },
    });
  }

  return serveStatic(res, pathname);
});

server.listen(port, () => {
  console.log(`Care Pulse server running at http://localhost:${port}`);
  console.log('Demo accounts: doctor1@carepulse.com / doctor123, admin@carepulse.com / admin123');

import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.info(`Care Pulse backend running on http://localhost:${env.port}`);
 main
});
