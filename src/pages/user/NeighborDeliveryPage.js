import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import { toast } from 'react-toastify';

export default function NeighborDeliveryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReadyOrders();
  }, []);

  const fetchReadyOrders = async () => {
    try {
      const { data } = await api.get('/orders/neighbor');
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load neighbor orders');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/claim-neighbor`);
      toast.success('🚘 Order Claimed! You are now the neighbor driver.');
      navigate(`/my-orders`); // or some dedicated tracking page for driver, but my-orders is fine for demo
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim order');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px', minHeight: '60vh' }}>
        <h2 style={{ fontSize: 28, marginBottom: 10 }}>🤝 Neighbor Hub</h2>
        <p style={{ color: '#666', marginBottom: 30 }}>Heading home? Claim a ready order near you, drop it off on your way, and earn <b>₹50 Wallet Credits</b> instantly!</p>

        {loading ? (
          <div className="loading">Loading potential deliveries...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="emoji" style={{ fontSize: 40 }}>🏠</div>
            <h3>No orders waiting for neighbor delivery</h3>
            <p>Check back later!</p>
          </div>
        ) : (
          <div className="orders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {orders.map(o => (
              <div key={o._id} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: 'var(--card-shadow)', border: '1px solid #eee' }}>
                <div style={{ fontWeight: 'bold', fontSize: 18, color: 'var(--orange)', marginBottom: 8 }}>{o.restaurantName}</div>
                <div style={{ fontSize: 14, color: '#555', marginBottom: 5 }}><i className="fas fa-map-marker-alt"></i> <b>Pickup:</b> {o.restaurant.location}</div>
                <div style={{ fontSize: 14, color: '#555', marginBottom: 15 }}><i className="fas fa-home"></i> <b>Dropoff:</b> {o.deliveryAddress}</div>
                
                <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: 8, fontSize: 13, marginBottom: 15 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 5 }}>Items:</div>
                  {o.items.map((i, idx) => <div key={idx}>{i.quantity}x {i.name}</div>)}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#2ecc71', fontWeight: 'bold' }}>Earn ₹50</div>
                  <button 
                    onClick={() => handleClaim(o._id)}
                    style={{ background: '#333', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Claim Delivery
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
