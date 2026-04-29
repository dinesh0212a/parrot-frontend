import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { validatePassword, validateUsername, validateEmail, validateName } from '../utils/validation';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // Step 1: Role, Step 2: Details
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: 'user', label: '👤 Customer', description: 'Order food online' },
    { id: 'restaurant', label: '🏪 Restaurant Owner', description: 'Manage restaurant & orders' },
    { id: 'delivery', label: '🏍️ Delivery Partner', description: 'Deliver orders & earn' },
  ];

  const validateForm = () => {
    const newErrors = {};

    const nameVal = validateName(form.name);
    if (!nameVal.valid) newErrors.name = nameVal.message;

    const usernameVal = validateUsername(form.username);
    if (!usernameVal.valid) newErrors.username = usernameVal.message;

    const emailVal = validateEmail(form.email);
    if (!emailVal.valid) newErrors.email = emailVal.message;

    const passwordVal = validatePassword(form.password);
    if (!passwordVal.valid) newErrors.password = passwordVal.message;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role
      });
      login(res.data.user, res.data.token);
      
      // Redirect based on role
      if (form.role === 'admin') navigate('/admin');
      else if (form.role === 'restaurant') navigate('/restaurant');
      else if (form.role === 'delivery') navigate('/delivery');
      else navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: step === 1 ? 500 : 460 }}>
        <div className="auth-logo">
          <div className="emoji">🦜</div>
          <h2>Join <span>Parrot</span></h2>
          <p>{step === 1 ? 'Choose what you want to do' : 'Tell us about yourself'}</p>
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

        {step === 1 ? (
          // Step 1: Role Selection
          <div>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 16, textAlign: 'center' }}>
              Select your account type:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {roles.map(role => (
                <div
                  key={role.id}
                  onClick={() => setForm({ ...form, role: role.id })}
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    border: form.role === role.id ? '2px solid var(--orange)' : '2px solid #eee',
                    background: form.role === role.id ? '#fff8f0' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (form.role !== role.id) {
                      e.currentTarget.style.borderColor = '#ddd';
                      e.currentTarget.style.background = '#f9f9f9';
                    }
                  }}
                  onMouseLeave={e => {
                    if (form.role !== role.id) {
                      e.currentTarget.style.borderColor = '#eee';
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{role.label}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{role.description}</div>
                    </div>
                    <div style={{ fontSize: 24 }}>
                      {form.role === role.id ? '✅' : '⭕'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setStep(2)}
              style={{ width: '100%' }}
            >
              Next →
            </button>
          </div>
        ) : (
          // Step 2: Details
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ borderColor: errors.name ? '#e74c3c' : undefined }}
              />
              {errors.name && <small style={{ color: '#e74c3c' }}>⚠️ {errors.name}</small>}
            </div>

            <div className="form-group">
              <label>Username * (unique)</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                style={{ borderColor: errors.username ? '#e74c3c' : undefined }}
              />
              {errors.username && <small style={{ color: '#e74c3c' }}>⚠️ {errors.username}</small>}
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                placeholder="youremail@gmail.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ borderColor: errors.email ? '#e74c3c' : undefined }}
              />
              {errors.email && <small style={{ color: '#e74c3c' }}>⚠️ {errors.email}</small>}
            </div>

            <div className="form-group">
              <label>Password * (min 6 characters)</label>
              <input
                type="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ borderColor: errors.password ? '#e74c3c' : undefined }}
              />
              {errors.password && <small style={{ color: '#e74c3c' }}>⚠️ {errors.password}</small>}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setStep(1)}
                style={{ flex: 1 }}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={loading}
              >
                {loading ? '⏳ Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <div className="auth-switch">
          Already have an account? <Link to="/login" style={{ color: 'var(--orange)', fontWeight: 600 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}

