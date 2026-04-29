import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

export default function LiveOrderFeed() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const intervalRef = useRef(null);
  const feedContainerRef = useRef(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/admin/orders');
        setOrders(res.data.slice(0, 5));
        if (feedContainerRef.current) {
          feedContainerRef.current.scrollTop = 0;
        }
      } catch {
        // silently skip if not admin
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchOrders, 8000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh]);

  const STATUS_COLOR = {
    pending: '#f39c12', confirmed: '#3498db', preparing: '#9b59b6',
    ready: '#1abc9c', assigned: '#16a085', out_for_delivery: '#ff6b35',
    delivered: '#27ae60', rejected_admin: '#e74c3c', rejected_restaurant: '#c0392b'
  };

  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: 24,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>📡 Live Order Feed</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (8s)
          </label>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: autoRefresh ? '#2ecc71' : '#e74c3c',
          }} />
        </div>
      </div>

      <div ref={feedContainerRef} style={{ maxHeight: 320, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#ccc' }}>
            <div style={{ fontSize: 28 }}>🦜</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#ccc' }}>
            <div style={{ fontSize: 28 }}>📭</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>No recent orders</div>
          </div>
        ) : orders.map(order => (
          <div key={order._id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
            borderBottom: '1px solid #f5f5f5'
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: STATUS_COLOR[order.status] || '#ccc', flexShrink: 0
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {order.restaurantName} — {order.user?.name || 'Customer'}
              </div>
              <div style={{ fontSize: 11, color: '#aaa' }}>
                #{order._id.slice(-6).toUpperCase()} · ₹{order.totalAmount}
              </div>
            </div>
            <span style={{
              background: (STATUS_COLOR[order.status] || '#888') + '20',
              color: STATUS_COLOR[order.status] || '#888',
              padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap'
            }}>
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
