import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser, clearAuthError } from '../features/auth/authSlice';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', bio: '' });
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

    if (!form.name || !form.email || !form.password) {
      setValidationError('Name, email, and password are required.');
      return;
    }
    if (form.password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created!');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create your SkillSwap account</h1>
        <p className="auth-subtitle">Teach what you know. Learn what you don't.</p>

        {(validationError || error) && (
          <div className="form-error">{validationError || error}</div>
        )}

        <label>
          Full name
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" />
        </label>

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@college.edu" />
        </label>

        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
        </label>

        <label>
          Short bio (optional)
          <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Tell peers a bit about yourself" rows={3} />
        </label>

        <button type="submit" className="btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
