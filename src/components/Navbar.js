import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, total } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (p) => location.pathname === p ? 'active' : '';

  const doLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <div className="promo-banner">
        🎉 Get 14% Off your first order — Promo: <strong>CARROT</strong>
      </div>
      <nav className="navbar">
        <Link to="/home" className="navbar-brand">
          <span className="logo-icon">🦜</span>
          <span className="logo-text">Parr<span>ot</span></span>
        </Link>

        <div className="nav-links">
          <Link to="/home"      className={isActive('/home')}>Home</Link>
          <Link to="/explore"   className={isActive('/explore')}>✨ Explore</Link>
          <Link to="/offers"    className={isActive('/offers')}>Special Offers</Link>
          <Link to="/my-orders" className={isActive('/my-orders')}>Track Order</Link>
          <Link to="/neighbor-hub" className={isActive('/neighbor-hub')}>🤝 Neighbor Hub</Link>
        </div>

        <div className="nav-right">
          <div className="location-badge">
            <i className="fas fa-map-marker-alt"></i>
            <span>SRM University, Potheri</span>
          </div>
          {user ? (
            <>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>
                <i className="fas fa-user" style={{ color: 'var(--orange)', marginRight: 6 }}></i>
                {user.name}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#2ecc71', background: '#eafaf1', padding: '4px 10px', borderRadius: 20 }}>
                Wallet: ₹{user.walletBalance || 0}
              </span>
              <button className="btn-outline btn-sm" onClick={doLogout}>Logout</button>
              {itemCount > 0 && (
                <div className="cart-btn">
                  <i className="fas fa-shopping-bag"></i> ₹{total}
                  <span className="cart-count">{itemCount}</span>
                </div>
              )}
            </>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="btn-primary btn-sm">Login / Signup</button>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
