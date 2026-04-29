import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

function Countdown({ expiresAt }) {
  const calc = () => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return '00:00';
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };
  const [time, setTime] = useState(calc());
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  return <span style={{ color: '#e67e22', fontWeight: 'bold', fontSize: 14 }}>⏱ {time} left</span>;
}

export default function FlashSalesPage() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [address, setAddress] = useState('');
  const [buying, setBuying] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/features/flash-sales');
      setSales(res.data);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { 
    load(); 
    const t = setInterval(load, 30000); 
    return () => clearInterval(t); 
  }, [load]);

  const openBuy = (sale) => { setSelectedSale(sale); setModal(true); };

  const handleBuy = async () => {
    if (!address.trim()) return toast.error('Enter delivery address');
    setBuying(true);
    try {
      const res = await api.post(`/features/flash-sales/${selectedSale.restaurantId}/${selectedSale._id}/buy`, { address });
      setModal(false);
      toast.success(res.data.message);
      navigate(`/track/${res.data.order._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to buy');
    } finally { setBuying(false); }
  };

  if (loading) {
    return (
      <div className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page-bg)' }}>
        <div style={{ fontSize: 40, animation: 'spin 1s linear infinite' }}>🦜</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>♻️</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#27ae60' }}>Zero-Waste Flash Sales</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 12, fontSize: 15, maxWidth: 500, margin: '12px auto 0', lineHeight: 1.6 }}>
          Grab quality food at 50–70% off before it goes to waste.
        </p>
      </div>

      <div style={{ maxWidth: 800, margin: '40px auto 0', padding: '0 20px' }}>
        {sales.length === 0 ? (
          <div className="empty-state" style={{ background: 'var(--card-bg)', borderRadius: 24, padding: '60px 20px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="emoji" style={{ fontSize: 60, marginBottom: 16 }}>🕐</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>No active flash sales right now</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 400, margin: '0 auto' }}>
              Check back around lunch or closing time — restaurants post deals to clear their fresh inventory!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {sales.map(item => {
              const pct = Math.round((1 - item.salePrice / item.originalPrice) * 100);
              return (
                <div key={item._id} style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 300px' }}>
                    <div style={{ fontSize: 50, background: '#f8f9fa', borderRadius: 16, padding: '10px 14px' }}>{item.emoji || '♻️'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--dark)' }}>{item.title}</h3>
                        <span style={{ background: '#27ae60', color: 'white', fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 12 }}>-{pct}%</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{item.restaurantEmoji} {item.restaurantName}</p>
                      {item.description && <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>{item.description}</p>}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: 24, fontWeight: 800, color: '#27ae60', marginRight: 8 }}>₹{item.salePrice}</span>
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>₹{item.originalPrice}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Countdown expiresAt={item.expiresAt} />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{item.remaining} left</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => openBuy(item)}
                      className="btn-green"
                      style={{ padding: '12px 24px', fontSize: 15 }}
                    >
                      Grab It!
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box" style={{ padding: 40, background: 'var(--card-bg)', borderRadius: 24, maxWidth: 500, width: '100%' }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#27ae60', textAlign: 'center', marginBottom: 20 }}>♻️ Confirm Flash Sale</h3>
            {selectedSale && (
              <div style={{ background: '#f8f9fa', borderRadius: 16, padding: 20, marginBottom: 24, textAlign: 'center', border: '1px solid #e0e0e0' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--dark)', marginBottom: 8 }}>{selectedSale.title}</p>
                <p style={{ fontSize: 14, color: '#27ae60', fontWeight: 800 }}>₹{selectedSale.salePrice} + ₹40 delivery = ₹{selectedSale.salePrice + 40}</p>
              </div>
            )}
            <textarea
              style={{ width: '100%', padding: '16px', borderRadius: 16, border: '2px solid var(--border-color)', fontSize: 15, background: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none', marginBottom: 24, minHeight: 120, resize: 'vertical' }}
              placeholder="Delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setModal(false)}
                className="btn-outline"
                style={{ flex: 1, padding: '14px', fontSize: 15, border: '2px solid var(--text-secondary)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleBuy} disabled={buying}
                className="btn-green"
                style={{ flex: 2, padding: '14px', fontSize: 15 }}
              >
                {buying ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
