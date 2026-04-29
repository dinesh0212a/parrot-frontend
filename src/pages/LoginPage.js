import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(''); 
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === 'admin')      navigate('/admin');
      else if (role === 'restaurant') navigate('/restaurant');
      else if (role === 'delivery')   navigate('/delivery');
      else navigate('/home');
    } catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <div className="auth-logo">
          <div className="emoji">🦜</div>
          <h2>Welcome to <span>Parrot</span></h2>
          <p>Feast Your Senses, Fast and Fresh</p>
        </div>
        {error && <div className="error-msg">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username or Email</label>
            <input 
              type="text" 
              placeholder="Enter username or email" 
              value={form.username} 
              onChange={e => setForm({ ...form, username: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? '⏳ Signing In...' : 'Login'}
          </button>
        </form>
        <div className="auth-switch">
          Don't have an account? <Link to="/register" style={{ color: 'var(--orange)', fontWeight: 600 }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
