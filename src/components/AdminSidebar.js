import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/admin',                icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
  { path: '/admin/orders',         icon: 'fas fa-receipt',        label: 'Orders' },
  { path: '/admin/restaurants',    icon: 'fas fa-store',          label: 'Restaurants' },
  { path: '/admin/offers',         icon: 'fas fa-tag',            label: 'Offers' },
  { path: '/admin/staff',          icon: 'fas fa-id-badge',       label: 'Staff & Accounts' },
  { path: '/admin/users',          icon: 'fas fa-users',          label: 'Customers' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { logout, user } = useAuth();

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>🦜 Parr<span style={{ color: 'var(--orange)' }}>ot</span></h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4 }}>Admin Panel</p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{user?.email}</p>
      </div>
      <nav className="admin-nav">
        {navItems.map(item => (
          <Link key={item.path} to={item.path}
            className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}>
            <i className={item.icon}></i>{item.label}
          </Link>
        ))}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '16px 0' }} />
        <Link to="/home" className="admin-nav-item"><i className="fas fa-home"></i>View Site</Link>
        <div className="admin-nav-item" style={{ color: '#e74c3c', cursor: 'pointer' }}
          onClick={() => { logout(); navigate('/login'); }}>
          <i className="fas fa-sign-out-alt"></i>Logout
        </div>
      </nav>
    </div>
  );
}
