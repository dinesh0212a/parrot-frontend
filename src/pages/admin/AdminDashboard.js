import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';
import OrderCounter from '../../components/lab/OrderCounter';
import OrderStatusBadge from '../../components/lab/OrderStatusBadge';
import LiveOrderFeed from '../../components/lab/LiveOrderFeed';
import ThemePanel from '../../components/lab/ThemePanel';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data));
  }, []);

  const cards = [
    { label: 'Restaurants',      icon: '🏪', color: '#ff6b35', value: stats?.restaurants },
    { label: 'Active Offers',    icon: '🎁', color: '#9b59b6', value: stats?.offers },
    { label: 'Total Orders',     icon: '📦', color: '#3498db', value: stats?.orders },
    { label: 'Pending Approval', icon: '⏳', color: '#f39c12', value: stats?.pendingOrders },
    { label: 'Customers',        icon: '👥', color: '#2ecc71', value: stats?.users },
    { label: 'Delivery Boys',    icon: '🏍️', color: '#1abc9c', value: stats?.deliveryBoys },
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">

        {/* Header */}
        <div className="admin-header" style={{ position: 'relative' }}>
          <div>
            <h1>Dashboard</h1>
            <div style={{ fontSize: 13, color: '#888' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <ThemePanel />
        </div>

        {/* Stats Cards */}
        <div className="stats-cards" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {cards.map(card => (
            <div key={card.label} className="stat-card">
              <div className="sc-icon" style={{ background: card.color + '20' }}>
                <span style={{ fontSize: 24 }}>{card.icon}</span>
              </div>
              <div className="sc-num">{stats ? (card.value ?? 0) : '...'}</div>
              <div className="sc-label">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Pending alert */}
        {stats?.pendingOrders > 0 && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 14, padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{stats.pendingOrders} order(s) awaiting your approval</div>
            <Link to="/admin/orders" style={{ marginLeft: 'auto', textDecoration: 'none' }}>
              <button className="btn-primary">Review Orders</button>
            </Link>
          </div>
        )}

        {/* Order Counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          <OrderCounter label="Pending Orders"    initialCount={stats?.pendingOrders || 0} />
          <OrderCounter label="Total Orders"      initialCount={stats?.orders || 0} />
          <OrderCounter label="Active Deliveries" initialCount={stats?.deliveryBoys || 0} />
        </div>

        {/* Status Badges */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, marginBottom: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--dark)' }}>Order Status Overview</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['pending','confirmed','preparing','ready','assigned','out_for_delivery','delivered','rejected_admin','rejected_restaurant']
              .map(s => <OrderStatusBadge key={s} status={s} size="large" />)}
          </div>
        </div>

        {/* Live Feed + Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
          <LiveOrderFeed />

          <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>⚡ Quick Actions</h3>
            {[
              { label: 'Review Pending Orders', icon: '⏳', href: '/admin/orders' },
              { label: 'Add Restaurant',        icon: '🏪', href: '/admin/restaurants' },
              { label: 'Create Offer',          icon: '🎁', href: '/admin/offers' },
              { label: 'Add Delivery Boy',      icon: '🏍️', href: '/admin/staff' },
              { label: 'Restaurant Accounts',   icon: '🔑', href: '/admin/staff' },
            ].map(a => (
              <Link key={a.label} to={a.href} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #f5f5f5', textDecoration: 'none', color: 'inherit' }}>
                <span style={{ fontSize: 20 }}>{a.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{a.label}</span>
                <i className="fas fa-chevron-right" style={{ marginLeft: 'auto', color: '#ccc', fontSize: 12 }}></i>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
