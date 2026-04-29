import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

function IngredientCustomModal({ visible, item, onClose, onConfirm }) {
  const [excluded, setExcluded] = useState([]);
  
  useEffect(() => { 
    if (visible) setExcluded([]); 
  }, [visible]);

  if (!visible || !item) return null;

  const toggle = (n) => setExcluded(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n]);
  const optionals = (item.ingredients || []).filter(i => i.optional);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ padding: 40, background: 'var(--card-bg)', borderRadius: 24, maxWidth: 500, width: '100%' }}>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark)', textAlign: 'center' }}>🥗 Customise</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 4, marginBottom: 20 }}>{item.name}</p>
        
        {optionals.length > 0 ? (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Tap to remove ingredients</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto', paddingRight: 4 }}>
              {optionals.map(ing => {
                const ex = excluded.includes(ing.name);
                return (
                  <button 
                    key={ing.name} 
                    onClick={() => toggle(ing.name)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 12, border: '1px solid', transition: 'all 0.2s', cursor: 'pointer',
                      background: ex ? '#fdedf0' : 'var(--card-bg-2)',
                      borderColor: ex ? '#e74c3c' : 'transparent'
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: ex ? '#e74c3c' : 'var(--dark)', textDecoration: ex ? 'line-through' : 'none' }}>
                      {ex ? '❌ ' : '✅ '}{ing.name}
                    </span>
                    {ex && <span style={{ fontSize: 12, fontWeight: 800, color: '#e74c3c' }}>Removed</span>}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '24px 0' }}>No customisable ingredients for this item.</p>
        )}
        
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button 
            onClick={onClose} 
            className="btn-outline"
            style={{ flex: 1, padding: '14px', fontSize: 15, border: '2px solid var(--text-secondary)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(excluded)} 
            className="btn-primary"
            style={{ flex: 2, padding: '14px', fontSize: 15 }}
          >
            Add ₹{item.price}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomeChefPage() {
  const navigate = useNavigate();
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChef, setSelectedChef] = useState(null);
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState('');
  const [ingModal, setIngModal] = useState(false);
  const [ingItem, setIngItem] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);

  useEffect(() => {
    api.get('/features/home-chefs').then(res => { 
      setChefs(res.data); setLoading(false); 
    }).catch(() => setLoading(false));
  }, []);

  const handleAdd = (item) => { 
    setIngItem(item); setIngModal(true); 
  };

  const handleIngConfirm = (excluded) => {
    setIngModal(false);
    const existing = cart.find(c => c._id === ingItem._id);
    if (existing) {
      setCart(cart.map(c => c._id === ingItem._id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...ingItem, qty: 1, excludedIngredients: excluded }]);
    }
    toast.success(`✅ ${ingItem.name} added`);
  };

  const removeItem = (id) => setCart(cart.filter(c => c._id !== id));

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0) + 40;

  const handlePlaceOrder = async () => {
    if (!address.trim()) return toast.error('Enter delivery address');
    setPlacing(true);
    try {
      const res = await api.post('/features/home-chefs/order', {
        restaurantId: selectedChef._id,
        items: cart.map(i => ({ menuItemId: i._id, qty: i.qty, excludedIngredients: i.excludedIngredients || [] })),
        address,
      });
      setCart([]); setCheckoutModal(false); setSelectedChef(null);
      toast.success('👩‍🍳 Home Chef order placed!');
      navigate(`/track/${res.data._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  if (loading) return (
    <div className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page-bg)' }}>
      <div style={{ fontSize: 40, animation: 'spin 1s linear infinite' }}>🦜</div>
    </div>
  );

  if (selectedChef) {
    const available = selectedChef.homeChefMenu?.filter(i => i.remaining > 0) || [];
    return (
      <div style={{ minHeight: '100vh', background: 'var(--page-bg)', paddingBottom: 120 }}>
        <div style={{ background: '#f5eef8', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 70, marginBottom: 16 }}>{selectedChef.emoji}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)' }}>{selectedChef.name}</h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 8, textAlign: 'center', maxWidth: 400 }}>{selectedChef.chefBio || 'Homemade food with love ❤️'}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 800, background: '#fff3e0', padding: '4px 12px', borderRadius: 16 }}>⭐ {selectedChef.rating}</span>
            <span style={{ fontSize: 13, color: '#e67e22', fontWeight: 800, background: '#fef5e7', padding: '4px 12px', borderRadius: 16 }}>👩‍🍳 Home Chef</span>
          </div>
          <button 
            onClick={() => { setSelectedChef(null); setCart([]); }}
            style={{ marginTop: 24, padding: '10px 20px', color: 'var(--orange)', fontWeight: 700, fontSize: 14, background: 'var(--card-bg)', borderRadius: 20, border: '1px solid var(--orange)', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            ← Back to Chefs
          </button>
        </div>

        <div style={{ maxWidth: 800, margin: '24px auto 0', padding: '0 20px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--dark)', marginBottom: 20 }}>Today's Menu</h2>
          {available.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--card-bg)', borderRadius: 24, padding: '40px 20px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
               <p style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 600 }}>No items available today 😔</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {available.map(item => (
                <div key={item._id} style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 20, display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                  <div style={{ fontSize: 40, marginRight: 20 }}>{item.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--dark)' }}>{item.name}</h3>
                    {item.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{item.description}</p>}
                    <p style={{ fontSize: 15, color: 'var(--orange)', fontWeight: 800, marginTop: 8 }}>₹{item.price} <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 400, marginLeft: 8 }}>· {item.remaining} portions left</span></p>
                    {item.ingredients?.length > 0 && <span style={{ fontSize: 11, background: '#e8f8f5', color: '#27ae60', fontWeight: 800, padding: '4px 8px', borderRadius: 8, textTransform: 'uppercase', marginTop: 8, display: 'inline-block' }}>🥗 Customisable</span>}
                  </div>
                  <button 
                    onClick={() => handleAdd(item)}
                    style={{ width: 44, height: 44, background: 'var(--orange)', border: 'none', borderRadius: '50%', color: 'white', fontSize: 28, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,107,53,0.3)', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--orange)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -10px 20px rgba(0,0,0,0.15)', zIndex: 40 }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{cart.reduce((s,i)=>s+i.qty,0)} items · ₹{total}</span>
            <button 
              onClick={() => setCheckoutModal(true)}
              style={{ background: 'white', color: 'var(--orange)', fontWeight: 800, padding: '12px 24px', borderRadius: 16, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 16 }}
            >
              Checkout →
            </button>
          </div>
        )}

        <IngredientCustomModal visible={ingModal} item={ingItem} onClose={() => setIngModal(false)} onConfirm={handleIngConfirm} />
        
        {checkoutModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCheckoutModal(false)}>
            <div className="modal-box" style={{ padding: 40, background: 'var(--card-bg)', borderRadius: 24, maxWidth: 500, width: '100%' }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark)', textAlign: 'center', marginBottom: 24 }}>👩‍🍳 Checkout</h3>
              
              <div style={{ background: 'var(--card-bg-2)', borderRadius: 16, padding: 20, marginBottom: 20, border: '1px solid var(--border-color)', maxHeight: 240, overflowY: 'auto' }}>
                {cart.map(i => (
                  <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ flex: 1, paddingRight: 12 }}>
                      <span style={{ fontSize: 15, color: 'var(--dark)', fontWeight: 700 }}>{i.name} <span style={{ color: 'var(--orange)' }}>×{i.qty}</span></span>
                      {i.excludedIngredients?.length > 0 && <p style={{ fontSize: 13, color: '#e74c3c', marginTop: 4 }}>❌ No {i.excludedIngredients.join(', ')}</p>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, paddingLeft: 12 }}>
                      <span style={{ fontSize: 15, color: 'var(--orange)', fontWeight: 800, marginBottom: 4 }}>₹{i.price * i.qty}</span>
                      <button onClick={() => removeItem(i._id)} style={{ fontSize: 13, color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ background: '#fff3e0', border: '1px solid #ffe0b2', padding: 20, borderRadius: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--dark)', display: 'flex', justifyContent: 'space-between' }}>
                  Total: <span style={{ color: 'var(--orange)' }}>₹{total}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right', marginTop: 4 }}>(incl. ₹40 delivery)</div>
              </div>
              
              <textarea 
                className="form-group"
                style={{ width: '100%', background: 'var(--input-bg)', border: '2px solid var(--input-border)', borderRadius: 16, padding: 16, color: 'var(--text-primary)', outline: 'none', minHeight: 100, marginBottom: 24, resize: 'vertical' }}
                placeholder="Delivery address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
              />
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={() => setCheckoutModal(false)} 
                  className="btn-outline"
                  style={{ flex: 1, padding: '14px', fontSize: 15, border: '2px solid var(--text-secondary)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePlaceOrder} 
                  disabled={placing}
                  className="btn-primary"
                  style={{ flex: 2, padding: '14px', fontSize: 15, opacity: placing ? 0.7 : 1 }}
                >
                  {placing ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>👩‍🍳</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#e67e22', marginBottom: 12 }}>Home Chef Marketplace</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
          Authentic homemade food from certified local kitchens — the Etsy of food!
        </p>
      </div>
      
      {chefs.length === 0 ? (
        <div className="empty-state" style={{ maxWidth: 600, margin: '40px auto 0' }}>
          <div className="emoji" style={{ fontSize: 70, marginBottom: 16 }}>🏠</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>No Home Chefs available</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
            Check back soon — local chefs post their daily specials in the morning!
          </p>
        </div>
      ) : (
        <div style={{ maxWidth: 800, margin: '40px auto 0', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {chefs.map(item => (
            <button 
              key={item._id} 
              onClick={() => setSelectedChef(item)}
              style={{ width: '100%', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', boxShadow: 'var(--card-shadow)', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
            >
              <span style={{ fontSize: 50, marginRight: 24, flexShrink: 0 }}>{item.emoji}</span>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--dark)' }}>{item.name}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>{item.chefBio || 'Homemade food with love ❤️'}</p>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--orange)', background: '#fff3e0', padding: '4px 12px', borderRadius: 12 }}>⭐ {item.rating}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#27ae60', background: '#e8f8f5', padding: '4px 12px', borderRadius: 12 }}>
                    {item.homeChefMenu?.filter(i => i.remaining > 0).length || 0} items today
                  </span>
                </div>
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 32, padding: '0 8px' }}>›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
