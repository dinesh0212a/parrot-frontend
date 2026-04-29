import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';
// [STATELESS CLASS COMPONENT] — Ex 2b
import OrderStatusBadge from '../../components/lab/OrderStatusBadge';

const STATUS_COLOR = {
  pending:'#f39c12', confirmed:'#3498db', preparing:'#9b59b6', ready:'#1abc9c',
  assigned:'#16a085', out_for_delivery:'var(--orange)', delivered:'#27ae60',
  rejected_admin:'#e74c3c', rejected_restaurant:'#c0392b'
};
const STATUS_LABEL = {
  pending:'Pending', confirmed:'Confirmed', preparing:'Preparing', ready:'Food Ready',
  assigned:'Assigned', out_for_delivery:'Out for Delivery', delivered:'Delivered',
  rejected_admin:'Rejected (Admin)', rejected_restaurant:'Rejected (Restaurant)'
};
const TABS = ['pending','confirmed','preparing','ready','assigned','out_for_delivery','delivered','rejected_admin','rejected_restaurant'];

export default function AdminOrders() {
  const [orders, setOrders]           = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [tab, setTab]                 = useState('pending');
  const [loading, setLoading]         = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote]   = useState('');
  const [assignModal, setAssignModal] = useState(null);
  const [selectedBoy, setSelectedBoy] = useState('');

  const load = useCallback(() => {
    Promise.all([api.get('/admin/orders'), api.get('/admin/delivery-boys')])
      .then(([o, d]) => { setOrders(o.data); setDeliveryBoys(d.data); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirm  = async (id) => { await api.put(`/admin/orders/${id}/confirm`); toast.success('✅ Order confirmed'); load(); };
  const doReject = async () => {
    await api.put(`/admin/orders/${rejectModal}/reject`, { note: rejectNote });
    toast.success('Order rejected'); setRejectModal(null); setRejectNote(''); load();
  };
  const doAssign = async () => {
    if (!selectedBoy) return toast.error('Select a delivery boy');
    await api.put(`/admin/orders/${assignModal}/assign`, { deliveryBoyId: selectedBoy });
    toast.success('🏍️ Delivery boy assigned!'); setAssignModal(null); setSelectedBoy(''); load();
  };

  const counts  = TABS.reduce((a, t) => { a[t] = orders.filter(o => o.status === t).length; return a; }, {});
  const filtered = orders.filter(o => o.status === tab);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>📦 Orders Management</h1>
          <button className="btn-outline btn-sm" onClick={load}>🔄 Refresh</button>
        </div>

        {/* Status tabs */}
        <div className="status-tabs" style={{ marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t} className={`status-tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              <span style={{ color: tab===t ? 'white' : STATUS_COLOR[t] }}>●</span>{' '}
              {STATUS_LABEL[t]}
              {counts[t] > 0 && (
                <span style={{ background: tab===t?'rgba(255,255,255,0.3)':'var(--orange)', color:'white', borderRadius:10, padding:'1px 7px', fontSize:11, marginLeft:6 }}>
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? <div className="loading">🦜</div> : filtered.length === 0 ? (
          <div className="empty-state"><div className="emoji">📭</div><h3>No orders with this status</h3></div>
        ) : filtered.map(order => (
          <div key={order._id} className={`order-card ${order.status}`} style={{ marginBottom: 20 }}>
            <div className="order-card-header">
              <div className="order-id-block">
                <h3>#{order._id.slice(-6).toUpperCase()} — {order.restaurantName}</h3>
                <p>{new Date(order.createdAt).toLocaleString()} · 👤 {order.user?.name} ({order.user?.email})</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:700, fontSize:18, color:'var(--orange)' }}>₹{order.totalAmount}/-</div>
                {/* [STATELESS CLASS COMPONENT] OrderStatusBadge — Ex 2b */}
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            {/* Items */}
            <div className="order-items-list">
              {order.items.map((item,i) => <span key={i}>{item.quantity}x {item.name}</span>)}
            </div>

            {/* Delivery boy if assigned */}
            {order.deliveryBoy && (
              <div style={{ margin:'10px 0' }}>
                <span className="boy-badge">🏍️ {order.deliveryBoy.name} — {order.deliveryBoy.phone}</span>
              </div>
            )}
            {order.rejectionNote && (
              <div style={{ fontSize:12, color:'#e74c3c', marginTop:6 }}>Rejection reason: {order.rejectionNote}</div>
            )}

            {/* Admin actions */}
            <div className="order-actions">
              {order.status === 'pending' && (<>
                <button className="btn-green"  onClick={() => confirm(order._id)}>✅ Confirm Order</button>
                <button className="btn-red"    onClick={() => { setRejectModal(order._id); setRejectNote(''); }}>❌ Reject</button>
              </>)}
              {order.status === 'ready' && (
                <button className="btn-blue" onClick={() => { setAssignModal(order._id); setSelectedBoy(''); }}>
                  🏍️ Assign Delivery Boy
                </button>
              )}
              {!['pending','ready'].includes(order.status) && !order.status.startsWith('rejected') && (
                <div style={{ fontSize:13, color:'#888' }}>No admin action required at this stage</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setRejectModal(null)}>
          <div className="modal-box">
            <h2 style={{ color:'#e74c3c' }}>❌ Reject Order</h2>
            <p style={{ fontSize:14, color:'#666', marginBottom:16 }}>Provide a reason for rejection:</p>
            <textarea className="reject-note" placeholder="e.g. Restaurant unavailable, item out of stock..." value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn-red" onClick={doReject}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Delivery Modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setAssignModal(null)}>
          <div className="modal-box">
            <h2>🏍️ Assign Delivery Boy</h2>
            <p style={{ fontSize:14, color:'#666', marginBottom:20 }}>Select a delivery partner for this order:</p>
            {deliveryBoys.length === 0 ? (
              <div style={{ textAlign:'center', padding:20, color:'#888' }}>
                No delivery boys registered. Add one in Staff & Accounts.
              </div>
            ) : deliveryBoys.map(boy => (
              <div key={boy._id}
                onClick={() => setSelectedBoy(boy._id)}
                style={{
                  display:'flex', alignItems:'center', gap:14, padding:14, borderRadius:12, cursor:'pointer',
                  border: `2px solid ${selectedBoy===boy._id ? 'var(--orange)' : '#e0e0e0'}`,
                  background: selectedBoy===boy._id ? '#fff3ee' : 'white', marginBottom:10, transition:'all .2s'
                }}
              >
                <div style={{ width:42, height:42, borderRadius:'50%', background:'var(--orange)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:18 }}>🏍️</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{boy.name}</div>
                  <div style={{ fontSize:12, color:'#888' }}>{boy.phone} · {boy.vehicle}</div>
                </div>
                {selectedBoy === boy._id && <span style={{ marginLeft:'auto', color:'var(--orange)', fontWeight:700 }}>✓ Selected</span>}
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={doAssign} disabled={!selectedBoy}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
