import { useState } from 'react';
import { api } from '../api/client';

const initialState = { name: '', email: '', password: '' };

export default function AuthPage({ onAuthenticated }) {
  const [form, setForm] = useState(initialState);
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const data = await api.login({ email: form.email, password: form.password });
        localStorage.setItem('carepulse_token', data.token);
        localStorage.setItem('carepulse_user', JSON.stringify(data.user));
        onAuthenticated(data.user);
      } else {
        await api.register(form);
        setMessage('Registration done. Check email verification link from backend logs/SMTP.');
        setIsLogin(true);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold text-slate-800">{isLogin ? 'Login' : 'Register'}</h2>
      <form className="space-y-4" onSubmit={submit}>
        {!isLogin && (
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        )}
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        />
        <button
          className="w-full rounded-md bg-primary-600 px-4 py-2 font-semibold text-white"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setIsLogin((prev) => !prev)}
        className="mt-4 text-sm font-medium text-primary-700"
      >
        {isLogin ? 'Need an account? Register' : 'Already registered? Login'}
      </button>
      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
    </div>
  );
}
