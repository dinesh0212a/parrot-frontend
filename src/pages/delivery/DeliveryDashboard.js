import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const STATUS_LABEL = {
  ready: 'Available to Pick',
  assigned: 'Assigned – Pickup Required',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered'
};
const STATUS_COLOR = {
  ready: '#9b59b6',
  assigned: '#1abc9c',
  out_for_delivery: 'var(--orange)',
  delivered: '#27ae60'
};
const TABS = ['ready', 'assigned', 'out_for_delivery', 'delivered'];

export default function DeliveryDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders]     = useState([]);
  const [stats, setStats]       = useState({ total: 0, active: 0, delivered: 0, totalEarnings: 0, todayEarnings: 0 });
  const [tab, setTab]           = useState('ready');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const [ordersRes, statsRes] = await Promise.all([
        api.get('/delivery/orders'),
        api.get('/delivery/stats')
      ]);
      setOrders(ordersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load data';
      setError(msg);
      console.error('Delivery load error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const doAction = async (id, action) => {
    try {
      await api.put(`/delivery/orders/${id}/${action}`);
      const msgs = {
        accept: '📦 Order accepted!',
        pickup: '🏍️ Picked up! On the way...',
        delivered: '🎉 Delivered successfully!'
      };
      toast.success(msgs[action] || 'Success!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const doLogout = () => { logout(); navigate('/login'); };
  const filtered = orders.filter(o => o.status === tab);
  const counts   = TABS.reduce((acc, t) => {
    acc[t] = orders.filter(o => o.status === t).length;
    return acc;
  }, {});

  return (
    <div className="portal-layout">
      {/* Top Bar */}
      <div className="portal-topbar" style={{ background: 'linear-gradient(135deg,#1a1a2e,#0f3460)' }}>
        <div className="brand">
          <span style={{ fontSize: 26 }}>🏍️</span>
          <div>
            <h2>Parrot <span style={{ color: 'var(--orange)' }}>Delivery</span></h2>
            <div className="sub">Delivery Partner Portal</div>
          </div>
        </div>
        <div className="right">
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>👋 {user.name}</span>
          <button className="btn-outline btn-sm" onClick={doLogout}>Logout</button>
        </div>
      </div>

      <div className="portal-content">
        {/* Error banner */}
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffaaaa', borderRadius: 10, padding: '14px 20px', marginBottom: 20, color: '#e74c3c', fontSize: 14 }}>
            ⚠️ {error} — <button onClick={load} style={{ background: 'none', border: 'none', color: 'var(--orange)', cursor: 'pointer', fontWeight: 700, fontFamily: 'Poppins' }}>Retry</button>
          </div>
        )}

        {/* Stats */}
        <div className="del-stats">
          <div className="del-stat">
            <div className="num" style={{ color: '#1abc9c' }}>{stats.active}</div>
            <div className="lbl">Active Deliveries</div>
          </div>
          <div className="del-stat">
            <div className="num" style={{ color: '#27ae60' }}>{stats.delivered}</div>
            <div className="lbl">Delivered</div>
          </div>
          <div className="del-stat">
            <div className="num" style={{ color: 'var(--orange)' }}>₹ {stats.totalEarnings || 0}</div>
            <div className="lbl">Total Earnings</div>
          </div>
          <div className="del-stat">
            <div className="num" style={{ color: '#2ecc71' }}>₹ {stats.todayEarnings || 0}</div>
            <div className="lbl">Today's Earnings</div>
          </div>
        </div>

        <div className="portal-header">
          <h1>📦 My Deliveries</h1>
          <button className="btn-outline btn-sm" onClick={load}>🔄 Refresh</button>
        </div>

        {/* Tabs */}
        <div className="status-tabs">
          {TABS.map(t => (
            <button key={t} className={`status-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {STATUS_LABEL[t]}
              {counts[t] > 0 && (
                <span style={{ background: 'var(--orange)', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 6 }}>
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">🦜</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">{tab === 'ready' ? '📦' : tab === 'assigned' ? '📭' : tab === 'out_for_delivery' ? '🏍️' : '🎉'}</div>
            <h3>
              {tab === 'ready' ? 'No orders ready for pickup'
                : tab === 'assigned' ? 'No pickups assigned yet'
                : tab === 'out_for_delivery' ? 'No active deliveries'
                : 'No delivered orders'}
            </h3>
            <p>{tab === 'ready' ? 'Orders will appear here when restaurants mark them ready'
              : tab === 'assigned' ? 'Please pick up your assigned orders'
              : 'Check back soon!'}</p>
          </div>
        ) : filtered.map(order => (
          <div key={order._id} className={`order-card ${order.status}`}>
            <div className="order-card-header">
              <div className="order-id-block">
                <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--orange)' }}>₹{order.totalAmount}/-</div>
                <div style={{ fontSize: 13, color: '#27ae60', fontWeight: 700, marginBottom: 6 }}>
                  Your Earning: ₹{order.deliveryEarnings || 40}
                </div>
                <span style={{ background: STATUS_COLOR[order.status] + '20', color: STATUS_COLOR[order.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                  {STATUS_LABEL[order.status]}
                </span>
              </div>
            </div>

            {/* Pickup / Dropoff cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div style={{ background: '#fff3ee', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--orange)', marginBottom: 6, letterSpacing: 1 }}>🏪 PICKUP FROM</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{order.restaurantName}</div>
              </div>
              <div style={{ background: '#e8f5e9', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#27ae60', marginBottom: 6, letterSpacing: 1 }}>📍 DELIVER TO</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{order.deliveryAddress || 'SRM University, Potheri'}</div>
                {order.user?.name && <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>👤 {order.user.name}</div>}
              </div>
            </div>

            {/* Items */}
            <div className="order-items-list">
              {order.items.map((item, i) => (
                <span key={i}>{item.quantity}x {item.name}</span>
              ))}
            </div>

            {/* Actions */}
            <div className="order-actions">
              {order.status === 'ready' && (
                <button className="btn-primary" style={{ fontSize: 15, padding: '12px 28px', background: '#9b59b6', borderColor: '#9b59b6' }} onClick={() => doAction(order._id, 'accept')}>
                  📦 Accept & Pick Up Order
                </button>
              )}
              {order.status === 'assigned' && (
                <button className="btn-primary" style={{ fontSize: 15, padding: '12px 28px' }} onClick={() => doAction(order._id, 'pickup')}>
                  🏍️ I've Picked Up — Start Delivery
                </button>
              )}
              {order.status === 'out_for_delivery' && (
                <button className="btn-green" style={{ fontSize: 15, padding: '12px 28px' }} onClick={() => doAction(order._id, 'delivered')}>
                  🎉 Mark as Delivered
                </button>
              )}
              {order.status === 'delivered' && (
                <div className="boy-badge" style={{ fontSize: 14, padding: '10px 20px' }}>
                  ✅ Successfully Delivered
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
