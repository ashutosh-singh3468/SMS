import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import Sidebar from '../components/Sidebar';

export default function DashboardPage({ user }) {
  const [tab, setTab] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ search: '', department: '' });
  const [bookForm, setBookForm] = useState({ doctorId: '', appointmentDate: '', appointmentTime: '', symptoms: '' });
  const [message, setMessage] = useState('');

  const refreshDoctors = async () => {
    const params = new URLSearchParams(filters);
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await api.doctors(query);
    setDoctors(data.doctors);
  };

  const refreshAppointments = async () => {
    const data = await api.myAppointments();
    setAppointments(data.appointments);
  };

  useEffect(() => {
    refreshDoctors();
    refreshAppointments();
  }, []);

  const stats = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter((item) => item.status === 'Pending').length,
      cancelled: appointments.filter((item) => item.status === 'Cancelled').length,
    }),
    [appointments],
  );

  const handleBook = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await api.bookAppointment(bookForm);
      setBookForm({ doctorId: '', appointmentDate: '', appointmentTime: '', symptoms: '' });
      setMessage('Appointment booked successfully.');
      await refreshAppointments();
      setTab('appointments');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleCancel = async (id) => {
    await api.cancelAppointment(id);
    await refreshAppointments();
  };

  return (
    <div className="flex min-h-[calc(100vh-84px)] flex-col md:flex-row">
      <Sidebar currentTab={tab} onChange={setTab} />
      <main className="flex-1 p-6">
        {tab === 'dashboard' && (
          <section className="grid gap-4 md:grid-cols-3">
            <Card title="Welcome" value={`Hi ${user.name}`} />
            <Card title="Total Appointments" value={stats.total} />
            <Card title="Pending" value={stats.pending} />
          </section>
        )}

        {tab === 'doctors' && (
          <section>
            <h2 className="mb-4 text-xl font-bold">Available Doctors</h2>
            <div className="mb-4 grid gap-2 md:grid-cols-2">
              <input
                className="rounded-md border border-slate-300 px-3 py-2"
                placeholder="Search by name or specialization"
                value={filters.search}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              />
              <input
                className="rounded-md border border-slate-300 px-3 py-2"
                placeholder="Filter by department"
                value={filters.department}
                onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}
              />
            </div>
            <button
              type="button"
              onClick={refreshDoctors}
              className="mb-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Search
            </button>
            <div className="grid gap-4 md:grid-cols-2">
              {doctors.map((doctor) => (
                <article key={doctor.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold">{doctor.name}</h3>
                  <p className="text-sm text-slate-600">{doctor.department}</p>
                  <p className="text-sm text-slate-600">{doctor.specialization}</p>
                  <p className="mt-2 text-xs text-slate-500">Slots: {doctor.availableSlots.join(', ')}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'book' && (
          <section className="max-w-xl">
            <h2 className="mb-4 text-xl font-bold">Book Appointment</h2>
            <form className="space-y-3" onSubmit={handleBook}>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="Doctor ID"
                value={bookForm.doctorId}
                onChange={(event) => setBookForm((prev) => ({ ...prev, doctorId: event.target.value }))}
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                type="date"
                value={bookForm.appointmentDate}
                onChange={(event) =>
                  setBookForm((prev) => ({ ...prev, appointmentDate: event.target.value }))
                }
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                type="time"
                value={bookForm.appointmentTime}
                onChange={(event) =>
                  setBookForm((prev) => ({ ...prev, appointmentTime: event.target.value }))
                }
              />
              <textarea
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="Symptoms"
                rows={4}
                value={bookForm.symptoms}
                onChange={(event) => setBookForm((prev) => ({ ...prev, symptoms: event.target.value }))}
              />
              <button className="rounded-md bg-primary-600 px-4 py-2 text-white" type="submit">
                Book
              </button>
            </form>
            {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
          </section>
        )}

        {tab === 'appointments' && (
          <section>
            <h2 className="mb-4 text-xl font-bold">My Appointments</h2>
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold">Doctor #{appointment.doctorId}</p>
                    <p className="text-sm text-slate-600">
                      {appointment.appointmentDate} at {appointment.appointmentTime}
                    </p>
                    <p className="text-xs text-slate-500">Symptoms: {appointment.symptoms}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">{appointment.status}</span>
                    {appointment.status === 'Pending' && (
                      <button
                        type="button"
                        onClick={() => handleCancel(appointment.id)}
                        className="rounded bg-rose-600 px-3 py-1 text-xs text-white"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-1 text-2xl font-bold text-slate-800">{value}</h3>
    </article>
  );
}
