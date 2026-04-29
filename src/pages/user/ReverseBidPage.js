import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const STATUS_COLORS = { open: { color: '#e67e22', bg: '#fef5e7', border: '#fadbd8' }, accepted: { color: '#27ae60', bg: '#e8f8f5', border: '#d4efdf' }, expired: { color: '#e74c3c', bg: '#fdedf0', border: '#fadbd8' } };
const STATUS_LABELS = { open: '⏳ Waiting for restaurant', accepted: '✅ Accepted!', expired: '❌ Expired' };

export default function ReverseBidPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('new'); // 'new' | 'my'
  const [desc, setDesc] = useState('');
  const [budget, setBudget] = useState('');
  const [address, setAddress] = useState('');
  const [dietNotes, setDietNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [myBids, setMyBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);

  const loadMyBids = async () => {
    setLoadingBids(true);
    try {
      const res = await api.get('/features/bids/my');
      setMyBids(res.data);
    } catch (_) {}
    setLoadingBids(false);
  };

  useEffect(() => { 
    if (tab === 'my') loadMyBids(); 
  }, [tab]);

  const handlePlaceBid = async () => {
    if (!desc.trim()) return toast.error('Describe what you want');
    if (!budget || Number(budget) < 60) return toast.error('Minimum bid is ₹60');
    if (!address.trim()) return toast.error('Enter delivery address');
    
    setPlacing(true);
    try {
      await api.post('/features/bids', {
        description: desc,
        budget: Number(budget),
        address,
        dietaryNotes: dietNotes,
      });
      toast.success('🎯 Bid placed! Restaurants nearby are notified.');
      setDesc(''); setBudget(''); setAddress(''); setDietNotes('');
      setTab('my');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to place bid');
    } finally { 
      setPlacing(false); 
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>⚖️</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#9b59b6' }}>Reverse Bid</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 12, fontSize: 15, maxWidth: 500, margin: '12px auto 0', lineHeight: 1.6 }}>
          Name your price. Restaurants race to accept during off-peak hours!
        </p>
      </div>

      <div style={{ maxWidth: 600, margin: '40px auto 0', padding: '0 20px' }}>
        <div style={{ display: 'flex', background: 'var(--card-bg-2)', borderRadius: 16, padding: 6, marginBottom: 32, border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setTab('new')} 
            style={{ flex: 1, padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, transition: 'all 0.2s', border: 'none', cursor: 'pointer', background: tab === 'new' ? 'var(--orange)' : 'transparent', color: tab === 'new' ? 'white' : 'var(--text-secondary)' }}
          >
            + New Bid
          </button>
          <button 
            onClick={() => setTab('my')} 
            style={{ flex: 1, padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, transition: 'all 0.2s', border: 'none', cursor: 'pointer', background: tab === 'my' ? 'var(--orange)' : 'transparent', color: tab === 'my' ? 'white' : 'var(--text-secondary)' }}
          >
            📋 My Bids
          </button>
        </div>

        {tab === 'new' ? (
          <div style={{ background: 'var(--card-bg)', padding: 32, borderRadius: 24, boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 14, color: 'var(--dark)' }}>🍽️ What do you want?</label>
              <textarea
                style={{ width: '100%', padding: '16px', borderRadius: 12, border: '2px solid var(--input-border)', fontSize: 15, background: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none', minHeight: 100, resize: 'vertical' }}
                placeholder="e.g. Spicy chicken sandwich, Paneer butter masala, etc."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 14, color: 'var(--dark)' }}>💰 Total Budget (₹) — incl. delivery</label>
              <input
                type="number"
                style={{ width: '100%', padding: '16px', borderRadius: 12, border: '2px solid var(--input-border)', fontSize: 15, background: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none' }}
                placeholder="e.g. 150"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>Min ₹60. Delivery fee (₹40) is included in your bid.</p>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 14, color: 'var(--dark)' }}>📍 Delivery Address</label>
              <textarea
                style={{ width: '100%', padding: '16px', borderRadius: 12, border: '2px solid var(--input-border)', fontSize: 15, background: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none', minHeight: 100, resize: 'vertical' }}
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 14, color: 'var(--dark)' }}>🥗 Dietary Notes (optional)</label>
              <input
                type="text"
                style={{ width: '100%', padding: '16px', borderRadius: 12, border: '2px solid var(--input-border)', fontSize: 15, background: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none' }}
                placeholder="e.g. No onion, extra spicy, etc."
                value={dietNotes}
                onChange={(e) => setDietNotes(e.target.value)}
              />
            </div>

            <div style={{ background: '#f5eef8', border: '1px solid #d7bde2', borderRadius: 16, padding: '20px', marginTop: 8 }}>
              <h3 style={{ color: '#8e44ad', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>How Bidding Works</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#6c3483', fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>⏰ Your bid is live for 30 minutes</li>
                <li>🏃 Nearby restaurants see your request in real-time</li>
                <li>🎯 First restaurant to accept wins the order</li>
                <li>📱 You get notified instantly when someone accepts</li>
              </ul>
            </div>

            <button
              onClick={handlePlaceBid}
              disabled={placing}
              className="btn-purple"
              style={{ width: '100%', padding: '16px', fontSize: 18, marginTop: 12, opacity: placing ? 0.7 : 1 }}
            >
              {placing ? 'Processing...' : '⚖️ Place My Bid'}
            </button>
          </div>
        ) : (
          <div>
            {loadingBids ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
                <div style={{ fontSize: 40, animation: 'spin 1s linear infinite' }}>🦜</div>
              </div>
            ) : myBids.length === 0 ? (
               <div className="empty-state" style={{ background: 'var(--card-bg)', borderRadius: 24, padding: '60px 20px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                <div className="emoji" style={{ fontSize: 60, marginBottom: 16 }}>⚖️</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 600 }}>No bids yet. Place your first bid!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {myBids.map(item => (
                  <div key={item._id} style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--dark)', flex: 1, paddingRight: 16 }}>{item.description}</h3>
                      <div style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800, color: STATUS_COLORS[item.status].color, background: STATUS_COLORS[item.status].bg, border: `1px solid ${STATUS_COLORS[item.status].border}` }}>
                        {STATUS_LABELS[item.status]}
                      </div>
                    </div>
                    
                    <p style={{ color: 'var(--orange)', fontWeight: 800, fontSize: 15, marginBottom: 6 }}>Budget: ₹{item.budget}</p>
                    {item.dietaryNotes && <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>📝 {item.dietaryNotes}</p>}
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>Placed: {new Date(item.createdAt).toLocaleString()}</p>
                    
                    {item.status === 'accepted' && item.orderId && (
                      <button 
                        onClick={() => navigate(`/track/${item.orderId}`)}
                        className="btn-primary"
                        style={{ marginTop: 20, width: '100%', padding: '14px', fontSize: 15 }}
                      >
                        Track Order →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
