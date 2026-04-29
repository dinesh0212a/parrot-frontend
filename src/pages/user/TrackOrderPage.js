import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';

const ALL_STEPS = [
  { key: 'pending',              icon: '📋', label: 'Order Placed',         desc: 'Waiting for admin approval' },
  { key: 'confirmed',            icon: '✅', label: 'Confirmed by Admin',    desc: 'Sent to restaurant' },
  { key: 'preparing',            icon: '👨‍🍳', label: 'Being Prepared',        desc: 'Restaurant is cooking your order' },
  { key: 'ready',                icon: '📦', label: 'Food Ready',            desc: 'Ready for pickup by delivery' },
  { key: 'assigned',             icon: '🏍️', label: 'Delivery Assigned',     desc: 'A delivery boy is on the way to pick up' },
  { key: 'out_for_delivery',     icon: '🚀', label: 'Out for Delivery',      desc: 'Your order is on the way!' },
  { key: 'delivered',            icon: '🎉', label: 'Delivered!',            desc: 'Enjoy your meal!' },
];
const ORDER = ['pending','confirmed','preparing','ready','assigned','out_for_delivery','delivered'];

const STATUS_LABEL = {
  pending:'Pending', confirmed:'Confirmed', preparing:'Preparing', ready:'Food Ready',
  assigned:'Assigned', out_for_delivery:'Out for Delivery', delivered:'Delivered',
  rejected_admin:'Rejected by Admin', rejected_restaurant:'Rejected by Restaurant'
};

export default function TrackOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(res => { setOrder(res.data); setLoading(false); });
    const t = setInterval(() => api.get(`/orders/${id}`).then(r => setOrder(r.data)), 10000);
    return () => clearInterval(t);
  }, [id]);

  if (loading) return <div><Navbar /><div className="loading">🦜</div></div>;
  if (!order)  return <div><Navbar /><div className="empty-state"><div className="emoji">😢</div><h3>Order not found</h3></div></div>;

  const isRejected = order.status.startsWith('rejected');
  const currentIdx = ORDER.indexOf(order.status);

  return (
    <div>
      <Navbar />
      <div style={{ background:'linear-gradient(135deg,var(--dark),#0f3460)', padding:'40px', color:'white', textAlign:'center' }}>
        <h1 style={{ fontSize:36, fontWeight:800 }}>📦 Track Your Order</h1>
        <p style={{ color:'rgba(255,255,255,0.7)', marginTop:8 }}>from {order.restaurantName}</p>
      </div>

      <div className="tracking-page">
        <div className="tracking-card">
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:12, color:'#888' }}>Order ID</div>
              <div style={{ fontSize:14, fontWeight:700, fontFamily:'monospace' }}>#{order._id.slice(-8).toUpperCase()}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:12, color:'#888' }}>Total</div>
              <div style={{ fontSize:18, fontWeight:700, color:'var(--orange)' }}>₹{order.totalAmount}/-</div>
            </div>
          </div>

          {isRejected ? (
            <div style={{ background:'#fff0f0', border:'2px solid #ffcccc', borderRadius:14, padding:24, textAlign:'center' }}>
              <div style={{ fontSize:40 }}>❌</div>
              <h3 style={{ color:'#e74c3c', marginTop:12 }}>Order {STATUS_LABEL[order.status]}</h3>
              {order.rejectionNote && <p style={{ color:'#888', marginTop:8, fontSize:13 }}>Reason: {order.rejectionNote}</p>}
            </div>
          ) : (
            <div className="tracking-steps">
              {ALL_STEPS.map((step, idx) => {
                const isDone   = idx < currentIdx;
                const isActive = idx === currentIdx;
                return (
                  <div key={step.key} className="tracking-step">
                    {idx < ALL_STEPS.length - 1 && <div className={`step-connector ${isDone?'done':''}`} />}
                    <div className={`step-icon ${isDone?'done':isActive?'active':'pending'}`}>
                      {isDone ? '✓' : step.icon}
                    </div>
                    <div className="step-content">
                      <h4 style={{ color: idx > currentIdx ? '#ccc' : 'var(--dark)' }}>{step.label}</h4>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delivery boy info */}
          {order.deliveryBoy && (
            <div style={{ background:'#e8f5e9', borderRadius:12, padding:16, marginTop:20 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:8 }}>🏍️ Your Delivery Partner</div>
              <div style={{ fontSize:13 }}><b>{order.deliveryBoy.name}</b></div>
              {order.deliveryBoy.phone && <div style={{ fontSize:12, color:'#555', marginTop:4 }}>📞 {order.deliveryBoy.phone}</div>}
              {order.deliveryBoy.vehicle && <div style={{ fontSize:12, color:'#555', marginTop:2 }}>🏍️ {order.deliveryBoy.vehicle}</div>}
            </div>
          )}

          {/* Items */}
          <div style={{ background:'var(--light-bg)', borderRadius:12, padding:16, marginTop:20 }}>
            <h4 style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Order Items</h4>
            {order.items.map((item, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:'1px solid #f0f0f0' }}>
                <span>{item.quantity}x {item.name}</span>
                <span style={{ color:'var(--orange)', fontWeight:600 }}>₹{item.price*item.quantity}/-</span>
              </div>
            ))}
          </div>

          {/* History */}
          {order.statusHistory?.length > 0 && (
            <div style={{ marginTop:20 }}>
              <h4 style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>📋 Status History</h4>
              {[...order.statusHistory].reverse().map((h,i) => (
                <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:'1px solid #f5f5f5', fontSize:12 }}>
                  <div style={{ color:'#888', whiteSpace:'nowrap' }}>{new Date(h.time).toLocaleTimeString()}</div>
                  <div><span style={{ fontWeight:600 }}>{STATUS_LABEL[h.status]||h.status}</span> — {h.note}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
