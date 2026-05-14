import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      setError(data?.errors?.[0]?.message || data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink-900 text-white text-sm">L</span>
          <span className="font-semibold text-ink-900 tracking-tight">Library Booking</span>
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Create your account</h1>
        <p className="text-sm text-ink-500 mt-1">It only takes a minute.</p>

        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input name="name" required minLength={2} className="input"
                   value={form.name} onChange={onChange} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" required className="input"
                   value={form.email} onChange={onChange} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input name="password" type="password" required minLength={6} className="input"
                   value={form.password} onChange={onChange} placeholder="At least 6 characters" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="mt-8 text-sm text-ink-500 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-ink-900 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
