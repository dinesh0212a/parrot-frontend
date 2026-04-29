import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';
// [STATELESS CLASS COMPONENT] — Ex 2b
import OrderStatusBadge from '../../components/lab/OrderStatusBadge';

const STATUS_STYLE = {
  pending:              { bg:'#fff3cd', color:'#f39c12',  label:'⏳ Pending Approval' },
  confirmed:            { bg:'#d6eaf8', color:'#3498db',  label:'✅ Confirmed' },
  preparing:            { bg:'#e8daef', color:'#9b59b6',  label:'👨‍🍳 Preparing' },
  ready:                { bg:'#d5f5e3', color:'#27ae60',  label:'📦 Food Ready' },
  assigned:             { bg:'#d1f2eb', color:'#1abc9c',  label:'🏍️ Delivery Assigned' },
  out_for_delivery:     { bg:'#fff0e6', color:'var(--orange)', label:'🚀 Out for Delivery' },
  delivered:            { bg:'#d5f5e3', color:'#27ae60',  label:'🎉 Delivered' },
  rejected_admin:       { bg:'#fde8e8', color:'#e74c3c',  label:'❌ Rejected by Admin' },
  rejected_restaurant:  { bg:'#fde8e8', color:'#c0392b',  label:'❌ Rejected by Restaurant' },
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { api.get('/orders/my').then(res => { setOrders(res.data); setLoading(false); }); }, []);

  return (
    <div>
      <Navbar />
      <div style={{ background:'linear-gradient(135deg,var(--dark),#0f3460)', padding:'40px', color:'white', textAlign:'center' }}>
        <h1 style={{ fontSize:36, fontWeight:800 }}>📦 My Orders</h1>
      </div>
      <section className="section">
        {loading ? <div className="loading">🦜</div> : orders.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🛒</div><h3>No orders yet!</h3><p>Hungry? Browse our restaurants</p>
            <button className="btn-primary" style={{ marginTop:16 }} onClick={() => navigate('/home')}>Order Now</button>
          </div>
        ) : (
          <div style={{ maxWidth:800, margin:'0 auto' }}>
            {orders.map(order => {
              const s = STATUS_STYLE[order.status] || STATUS_STYLE.pending;
              return (
                <div key={order._id} style={{ background:'white', borderRadius:20, padding:24, marginBottom:20, boxShadow:'var(--card-shadow)', borderLeft:`5px solid ${s.color}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:16, fontWeight:700 }}>🍽️ {order.restaurantName}</div>
                      <div style={{ fontSize:12, color:'#888', marginTop:4 }}>{new Date(order.createdAt).toLocaleString()} · #{order._id.slice(-6).toUpperCase()}</div>
                    </div>
                    {/* [STATELESS CLASS COMPONENT] — Ex 2b */}
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div style={{ fontSize:13, color:'#666', marginBottom:12 }}>
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(' · ')}
                  </div>
                  {order.deliveryBoy && (
                    <div style={{ marginBottom:10 }}>
                      <span className="boy-badge">🏍️ {order.deliveryBoy.name} — {order.deliveryBoy.phone}</span>
                    </div>
                  )}
                  {order.rejectionNote && (
                    <div style={{ fontSize:12, color:'#e74c3c', marginBottom:10 }}>Reason: {order.rejectionNote}</div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontSize:16, fontWeight:700, color:'var(--orange)' }}>₹{order.totalAmount}/-</div>
                    {!order.status.startsWith('rejected') && (
                      <button className="btn-primary btn-sm" onClick={() => navigate(`/track/${order._id}`)}>Track Order</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
