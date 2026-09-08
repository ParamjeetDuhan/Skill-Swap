import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser, clearAuthError } from '../features/auth/authSlice';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [validationError, setValidationError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    dispatch(clearAuthError());

    if (!form.email || !form.password) {
      setValidationError('Please fill in both email and password.');
      return;
    }

    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Log in to SkillSwap</h1>
        <p className="auth-subtitle">Swap skills with peers who complement you.</p>

        {(validationError || error) && (
          <div className="form-error">{validationError || error}</div>
        )}

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@college.edu"
            autoComplete="email"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        <button type="submit" className="btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Logging in...' : 'Log in'}
        </button>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>

        <p className="demo-hint">
          Demo accounts (after running the seed script): alice@example.com / password123
        </p>
      </form>
    </div>
  );
}
