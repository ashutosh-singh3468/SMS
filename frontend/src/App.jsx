import { useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

function getStoredUser() {
  const raw = localStorage.getItem('carepulse_user');
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(getStoredUser());

  const logout = () => {
    localStorage.removeItem('carepulse_user');
    localStorage.removeItem('carepulse_token');
    setUser(null);
  };

  const content = useMemo(() => {
    if (!user) {
      return <AuthPage onAuthenticated={setUser} />;
    }
    return <DashboardPage user={user} />;
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} onLogout={logout} />
      {content}
    </div>
  );
}
