const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('carepulse_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const api = {
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyEmail: (token) => request(`/auth/verify-email?token=${token}`),
  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  doctors: (params = '') => request(`/doctors${params}`),
  bookAppointment: (payload) =>
    request('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  myAppointments: () => request('/appointments/mine'),
  cancelAppointment: (id) =>
    request(`/appointments/${id}/cancel`, {
      method: 'PATCH',
    }),
};
