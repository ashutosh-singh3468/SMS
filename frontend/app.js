const state = {
  token: localStorage.getItem('carepulse_token') || '',
  user: JSON.parse(localStorage.getItem('carepulse_user') || 'null'),
};

const views = document.querySelectorAll('.view');
const navButtons = document.querySelectorAll('.nav-btn');
const messageEl = document.getElementById('message');

function setMessage(text, kind = 'success') {
  messageEl.textContent = text;
  messageEl.style.color = kind === 'error' ? 'var(--danger)' : kind === 'warning' ? '#d97706' : 'var(--success)';
}

function switchView(viewName) {
  views.forEach((view) => view.classList.remove('active'));
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.view === viewName));
  document.getElementById(`view-${viewName}`).classList.add('active');
}

function updateSidebarProfile() {
  const name = state.user?.name || 'Guest User';
  const role = state.user?.role || 'Not logged in';
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('sidebarRole').textContent = role;
  document.getElementById('avatarLabel').textContent = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => switchView(button.dataset.view));
});

document.getElementById('themeBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('carepulse_token');
  localStorage.removeItem('carepulse_user');
  state.token = '';
  state.user = null;
  updateSidebarProfile();
  switchView('auth');
  setMessage('Logged out successfully.', 'warning');
});

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(`/api${path}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function register(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.target).entries());
  await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setMessage('Registration successful. Please login to continue.');
  event.target.reset();
}

async function login(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.target).entries());
  const result = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  state.token = result.token;
  state.user = result.user;
  localStorage.setItem('carepulse_token', state.token);
  localStorage.setItem('carepulse_user', JSON.stringify(state.user));
  updateSidebarProfile();

  await refreshAll();

  const roleDefaultView = state.user.role === 'Doctor' ? 'doctor' : state.user.role === 'Admin' ? 'dashboard' : 'patient';
  switchView(roleDefaultView);
  setMessage(`Welcome back, ${state.user.name}.`);
}

function statCard(label, value) {
  return `<div class="card glass stat-card"><h4>${label}</h4><p>${value}</p></div>`;
}

async function loadDashboardStats() {
  if (!state.token) return;
  const result = await api('/dashboard/stats');
  const stats = result.stats;

  const items = Object.entries(stats).map(([key, value]) => statCard(key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase()), value));
  document.getElementById('dashboardStats').innerHTML = items.join('');

  const subtitle = state.user.role === 'Patient'
    ? 'Track your bookings, approvals, and completed care.'
    : state.user.role === 'Doctor'
      ? 'Monitor today’s schedule and treatment progress.'
      : 'Executive insight across users and appointments.';
  document.getElementById('dashboardSubtitle').textContent = subtitle;
}

async function loadProfile() {
  if (!state.token) return;
  const result = await api('/profile');
  const form = document.getElementById('profileForm');
  const profile = result.profile;

  ['name', 'phone', 'age', 'gender', 'bloodGroup', 'bio', 'role'].forEach((field) => {
    if (form[field]) form[field].value = profile[field] ?? '';
  });
}

async function saveProfile(event) {
  event.preventDefault();
  if (!state.token) return;

  const payload = Object.fromEntries(new FormData(event.target).entries());
  delete payload.role;

  const result = await api('/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  state.user.name = result.profile.name;
  localStorage.setItem('carepulse_user', JSON.stringify(state.user));
  updateSidebarProfile();
  setMessage('Profile updated successfully.');
}

async function loadDoctors() {
  const search = document.getElementById('doctorSearch').value || '';
  const department = document.getElementById('doctorDepartment').value || '';
  const result = await api(`/doctors?${new URLSearchParams({ search, department })}`);

  const html = result.doctors.map((doctor) => `
    <div class="item">
      <strong>#${doctor.id} ${doctor.name}</strong> <span class="badge">${doctor.department}</span><br>
      ${doctor.specialization} • ${doctor.experience} • ⭐ ${doctor.rating}<br>
      <small>Available: ${doctor.availableSlots.join(', ')}</small>
    </div>
  `).join('') || '<div class="item">No doctors found.</div>';

  document.getElementById('doctorsList').innerHTML = html;
}

async function bookAppointment(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.target).entries());

  await api('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  setMessage('Appointment booked successfully.');
  event.target.reset();
  await loadMyAppointments();
  await loadMedicalHistory();
  await loadDashboardStats();
}

async function loadMyAppointments() {
  if (!state.token || state.user?.role !== 'Patient') return;
  const result = await api('/appointments/mine');

  const html = result.appointments.map((appointment) => `
    <div class="item">
      <strong>#${appointment.id} with ${appointment.doctorName}</strong>
      <span class="badge">${appointment.status}</span><br>
      ${appointment.appointmentDate} at ${appointment.appointmentTime} (${appointment.type})<br>
      Symptoms: ${appointment.symptoms}
      ${appointment.status === 'Pending' ? `<div class="actions"><button onclick="cancelAppointment(${appointment.id})">Cancel</button></div>` : ''}
    </div>
  `).join('') || '<div class="item">No appointments found.</div>';

  document.getElementById('myAppointments').innerHTML = html;
}

async function loadMedicalHistory() {
  if (!state.token || state.user?.role !== 'Patient') return;
  const result = await api('/appointments/history');

  const html = result.history.map((entry) => `
    <div class="item">
      <strong>Case #${entry.id}</strong> <span class="badge">${entry.status}</span><br>
      ${entry.appointmentDate} ${entry.appointmentTime}<br>
      Notes: ${entry.notes || 'No doctor notes yet.'}
    </div>
  `).join('') || '<div class="item">No medical history entries yet.</div>';

  document.getElementById('medicalHistory').innerHTML = html;
}

async function cancelAppointment(id) {
  await api(`/appointments/${id}/cancel`, { method: 'PATCH' });
  setMessage(`Appointment #${id} cancelled.`, 'warning');
  await loadMyAppointments();
  await loadDashboardStats();
  await loadNotifications();
}
window.cancelAppointment = cancelAppointment;

function doctorActionButtons(appt) {
  const statuses = ['Approved', 'Rejected', 'Completed', 'Reschedule Requested'];
  return statuses.map((status) => `<button onclick="updateAppointmentStatus(${appt.id}, '${status}')">${status}</button>`).join('');
}

async function loadDoctorAppointments() {
  if (!state.token || !['Doctor', 'Admin'].includes(state.user?.role)) return;
  const result = await api('/appointments/doctor');

  const html = result.appointments.map((appointment) => `
    <div class="item">
      <strong>#${appointment.id} - ${appointment.patientName}</strong>
      <span class="badge">${appointment.status}</span><br>
      ${appointment.appointmentDate} at ${appointment.appointmentTime} • ${appointment.type}<br>
      Symptoms: ${appointment.symptoms}<br>
      Notes: ${appointment.notes || 'No notes'}
      <div class="actions">${doctorActionButtons(appointment)}</div>
    </div>
  `).join('') || '<div class="item">No appointments assigned.</div>';

  document.getElementById('doctorAppointments').innerHTML = html;
}

async function updateAppointmentStatus(id, status) {
  const notes = prompt('Optional clinical notes:') || '';
  await api(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });

  setMessage(`Appointment #${id} updated to ${status}.`);
  await loadDoctorAppointments();
  await loadDashboardStats();
  await loadNotifications();
}
window.updateAppointmentStatus = updateAppointmentStatus;

async function updateSlots(event) {
  event.preventDefault();
  const slotsText = new FormData(event.target).get('slots') || '';
  const availableSlots = slotsText.split(',').map((item) => item.trim()).filter(Boolean);

  await api('/doctors/slots', {
    method: 'PATCH',
    body: JSON.stringify({ availableSlots }),
  });

  setMessage('Availability slots updated.');
  await loadDoctors();
  event.target.reset();
}

async function loadNotifications() {
  if (!state.token) return;
  const result = await api('/notifications');

  const html = result.notifications.map((notification) => `
    <div class="item">
      <strong>${notification.type.toUpperCase()}</strong>
      <span class="badge">${new Date(notification.createdAt).toLocaleString()}</span><br>
      ${notification.message}
    </div>
  `).join('') || '<div class="item">No notifications available.</div>';

  document.getElementById('notificationList').innerHTML = html;
}

async function refreshAll() {
  if (!state.token) return;

  await Promise.allSettled([
    loadDashboardStats(),
    loadProfile(),
    loadDoctors(),
    loadMyAppointments(),
    loadMedicalHistory(),
    loadDoctorAppointments(),
    loadNotifications(),
  ]);
}

document.getElementById('registerForm').addEventListener('submit', (event) => register(event).catch((error) => setMessage(error.message, 'error')));
document.getElementById('loginForm').addEventListener('submit', (event) => login(event).catch((error) => setMessage(error.message, 'error')));
document.getElementById('profileForm').addEventListener('submit', (event) => saveProfile(event).catch((error) => setMessage(error.message, 'error')));
document.getElementById('searchDoctorsBtn').addEventListener('click', () => loadDoctors().catch((error) => setMessage(error.message, 'error')));
document.getElementById('bookForm').addEventListener('submit', (event) => bookAppointment(event).catch((error) => setMessage(error.message, 'error')));
document.getElementById('doctorLoadBtn').addEventListener('click', () => loadDoctorAppointments().catch((error) => setMessage(error.message, 'error')));
document.getElementById('slotForm').addEventListener('submit', (event) => updateSlots(event).catch((error) => setMessage(error.message, 'error')));

updateSidebarProfile();
if (state.user) {
  refreshAll();
  setMessage(`Session restored for ${state.user.name}.`);
}
