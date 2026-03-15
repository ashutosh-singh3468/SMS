const tabs = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'doctors', label: 'View Doctors' },
  { key: 'book', label: 'Book Appointment' },
  { key: 'appointments', label: 'My Appointments' },
];

export default function Sidebar({ currentTab, onChange }) {
  return (
    <aside className="w-full border-r border-slate-200 bg-white p-4 md:w-64">
      <nav className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium ${
              currentTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
