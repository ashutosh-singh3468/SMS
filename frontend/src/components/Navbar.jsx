export default function Navbar({ user, onLogout }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Care Pulse</h1>
        <p className="text-xs text-slate-500">Hospital Appointment Booking System</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
          {user?.name || 'Guest'}
        </span>
        {user && (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
