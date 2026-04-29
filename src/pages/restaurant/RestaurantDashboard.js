import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const STATUS_LABEL = {
  confirmed: 'Confirmed – Needs Action',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  rejected_restaurant: 'Rejected'
};
const STATUS_COLOR = {
  confirmed: '#3498db', preparing: '#9b59b6',
  ready: '#27ae60', rejected_restaurant: '#e74c3c'
};
const ORDER_TABS = ['confirmed', 'preparing', 'ready', 'rejected_restaurant'];

// ── Features Request Component ──────────────────────────────────────
function RestaurantFeaturesTab({ profile, reload }) {
  const [flashForm, setFlashForm] = useState({ title: '', description: '', originalPrice: '', salePrice: '', quantity: '', expiresAt: '', emoji: '♻️' });
  const [creatingFlash, setCreatingFlash] = useState(false);
  const [mysteryDesc, setMysteryDesc] = useState(profile?.mysteryBoxDescription || '');

  const toggleMysteryBox = async (enabled) => {
    try {
      await api.put('/features/mystery/toggle', { enabled, description: mysteryDesc });
      reload();
      toast.success('Mystery Box toggled!');
    } catch { toast.error('Failed to toggle Mystery Box'); }
  };

  const createFlashSale = async (e) => {
    e.preventDefault();
    setCreatingFlash(true);
    try {
      await api.post('/features/flash-sales', { ...flashForm, originalPrice: Number(flashForm.originalPrice), salePrice: Number(flashForm.salePrice), quantity: Number(flashForm.quantity) });
      toast.success('Flash Sale Created Successfully!');
      setFlashForm({ title: '', description: '', originalPrice: '', salePrice: '', quantity: '', expiresAt: '', emoji: '♻️' });
      reload();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create Flash Sale'); }
    finally { setCreatingFlash(false); }
  };

  return (
    <>
      <div className="portal-header">
        <h1>✨ Restaurant Features</h1>
        <span style={{ fontSize: 13, color: '#666' }}>Manage special Parrot features</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        
        {/* Mystery Box Panel */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: 15 }}>🎲 Mystery Box / Food Roulette</h3>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 15 }}>Let users roll the dice on your menu! Provide a fun hint below.</p>
          <textarea className="form-group" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', minHeight: 80, marginBottom: 10, fontFamily: 'inherit' }} placeholder="e.g. You might get our famous Spicy Burger!" value={mysteryDesc} onChange={e => setMysteryDesc(e.target.value)} />
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {profile?.mysteryBoxEnabled ? (
              <button className="btn-red" onClick={() => toggleMysteryBox(false)}>Disable Mystery Box</button>
            ) : (
              <button className="btn-green" onClick={() => toggleMysteryBox(true)}>Enable Mystery Box</button>
            )}
          </div>
        </div>

        {/* Flash Sales Panel */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: 15 }}>♻️ Zero-Waste Flash Sales</h3>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 15 }}>Post highly discounted last-minute meals to reduce food waste.</p>
          <form onSubmit={createFlashSale}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ flex: 1 }}><label>Title</label><input required value={flashForm.title} onChange={e=>setFlashForm({...flashForm, title: e.target.value})} placeholder="e.g. End of Day Muffins" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} /></div>
              <div className="form-group" style={{ width: 60 }}><label>Emoji</label><input value={flashForm.emoji} onChange={e=>setFlashForm({...flashForm, emoji: e.target.value})} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} /></div>
            </div>
            <div className="form-group" style={{ marginTop: 10 }}><label>Description</label><input required value={flashForm.description} onChange={e=>setFlashForm({...flashForm, description: e.target.value})} placeholder="e.g. Pack of 3 blueberry muffins" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} /></div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <div className="form-group" style={{ flex: 1 }}><label>Orig. (₹)</label><input type="number" required value={flashForm.originalPrice} onChange={e=>setFlashForm({...flashForm, originalPrice: e.target.value})} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} /></div>
              <div className="form-group" style={{ flex: 1 }}><label>Sale (₹)</label><input type="number" required value={flashForm.salePrice} onChange={e=>setFlashForm({...flashForm, salePrice: e.target.value})} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} /></div>
              <div className="form-group" style={{ flex: 1 }}><label>Qty</label><input type="number" required value={flashForm.quantity} onChange={e=>setFlashForm({...flashForm, quantity: e.target.value})} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} /></div>
            </div>
            <div className="form-group" style={{ marginTop: 10, marginBottom: 15 }}><label>Expires At</label><input type="datetime-local" required value={flashForm.expiresAt} onChange={e=>setFlashForm({...flashForm, expiresAt: e.target.value})} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} /></div>
            <button className="btn-primary" type="submit" disabled={creatingFlash} style={{ width: '100%' }}>{creatingFlash ? 'Posting...' : 'Post Flash Sale'}</button>
          </form>
        </div>

      </div>
    </>
  );
}


// ── Menu Requests Component ──────────────────────────────────────
function MenuRequestsTab({ requests, reload }) {
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '', image: '', ingredients: '' });
  const [uploading, setUploading] = useState(false);

  const resolveUrl = (u) => u && u.startsWith('/uploads') ? 'http://localhost:5000' + u : u;

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ ...form, image: res.data.url });
      toast.success('Image uploaded!');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/restaurant/menu-requests', {
        itemName: form.name,
        price: Number(form.price),
        category: form.category,
        description: form.description,
        image: form.image,
        ingredients: form.ingredients.split(',').map(i => i.trim()).filter(i => i)
      });
      toast.success('Menu Request Sent to Admin!');
      setForm({ name: '', price: '', category: '', description: '', image: '', ingredients: '' });
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    }
  };

  return (
    <>
      <div className="portal-header">
        <h1>📝 Menu Requests</h1>
        <span style={{ fontSize: 13, color: '#666' }}>Ask admin to approve new menu items</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <div>
          <h3>Pending & Processed Requests</h3>
          {requests.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}><p>No requests sent yet.</p></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <thead style={{ background: '#f0f0f0' }}><tr>
                <th style={{ padding: 10, textAlign:'left' }}>Item Name</th>
                <th style={{ padding: 10 }}>Price</th>
                <th style={{ padding: 10 }}>Status</th>
              </tr></thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 10 }}>
                      <div style={{display:'flex', alignItems:'center', gap: 10}}>
                        {r.image && <img src={resolveUrl(r.image)} alt="" style={{width: 30, height: 30, borderRadius: 5, objectFit:'cover'}} />}
                        {r.itemName}
                      </div>
                    </td>
                    <td style={{ padding: 10, textAlign:'center' }}>₹{r.price}</td>
                    <td style={{ padding: 10, textAlign:'center' }}>
                      <span className={`badge ${r.status === 'approved' ? 'badge-green' : r.status==='rejected' ? 'badge-red' : 'badge-orange'}`}>{r.status.toUpperCase()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: 15 }}>Submit New Item</h3>
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Item Name</label>
              <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input value={form.category} onChange={e=>setForm({...form, category: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={form.description} onChange={e=>setForm({...form, description: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Ingredients (Optional, comma separated)</label>
              <input value={form.ingredients} onChange={e=>setForm({...form, ingredients: e.target.value})} placeholder="e.g. Tomato, Onion, Extra Cheese" />
            </div>
            <div className="form-group">
              <label>Image Upload</label>
              <input type="file" accept="image/*" onChange={handleImage} />
              {uploading && <div style={{fontSize: 12, color: '#f39c12', marginTop: 5}}>Uploading...</div>}
              {form.image && <img src={resolveUrl(form.image)} alt="" style={{width: '100%', height: 100, objectFit:'cover', borderRadius: 8, marginTop: 10}} />}
            </div>
            <button className="btn-primary" type="submit" style={{width:'100%'}}>Send Request</button>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function RestaurantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Global state
  const [orders, setOrders]           = useState([]);
  const [bids, setBids]               = useState([]);
  const [menu, setMenu]               = useState([]);
  const [menuRequests, setMenuRequests] = useState([]);
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Tabs: 'orders' | 'menu'
  const [mainTab, setMainTab]         = useState('orders');

  // Orders sub-tab
  const [orderTab, setOrderTab]       = useState('confirmed');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote]   = useState('');

  const resolveUrl = (u) =>
    u && u.startsWith('/uploads') ? 'http://localhost:5000' + u : u;

  const load = useCallback(async () => {
    try {
      setError('');
      const [ordersRes, profileRes, menuRes, bidsRes, menuReqRes] = await Promise.all([
        api.get('/restaurant/orders'),
        api.get('/restaurant/profile'),
        api.get('/restaurant/menu'),
        api.get('/features/bids/open'),
        api.get('/restaurant/menu-requests').catch(() => ({ data: [] }))
      ]);
      setOrders(ordersRes.data);
      setProfile(profileRes.data);
      setMenu(menuRes.data);
      setBids(bidsRes.data);
      setMenuRequests(menuReqRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  // ── Order actions ──────────────────────────────────────
  const doAction = async (id, action) => {
    try {
      await api.put('/restaurant/orders/' + id + '/' + action);
      toast.success(action === 'preparing' ? '👨‍🍳 Started preparing!' : '✅ Food marked ready!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const acceptBid = async (id) => {
    try {
      await api.put(`/features/bids/${id}/accept`);
      toast.success('Bid accepted! Order created. Please check Orders tab.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept bid');
    }
  };

  const toggleZeroWaste = async () => {
    try {
      const res = await api.put('/restaurant/zero-waste');
      setProfile(res.data);
      toast.success(res.data.isZeroWaste ? '♻️ Zero-Waste Event Started!' : 'Normal mode resumed');
    } catch {
      toast.error('Failed to toggle Zero-Waste mode');
    }
  };

  const doReject = async () => {
    try {
      await api.put('/restaurant/orders/' + rejectModal + '/reject', {
        note: rejectNote || 'Rejected by restaurant'
      });
      toast.success('Order rejected');
      setRejectModal(null);
      setRejectNote('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const doLogout = () => { logout(); navigate('/login'); };

  const filtered = orders.filter(o => o.status === orderTab);
  const counts   = ORDER_TABS.reduce((acc, t) => {
    acc[t] = orders.filter(o => o.status === t).length;
    return acc;
  }, {});

  // ── Error State ────────────────────────────────────────
  if (!loading && error) {
    return (
      <div className="portal-layout">
        <div className="portal-topbar">
          <div className="brand">
            <span style={{ fontSize: 26 }}>🦜</span>
            <div><h2>Parrot <span style={{ color: 'var(--orange)' }}>Restaurant</span></h2></div>
          </div>
          <div className="right">
            <button className="btn-outline btn-sm" onClick={doLogout}>Logout</button>
          </div>
        </div>
        <div className="portal-content">
          <div style={{ background: '#fff0f0', border: '2px solid #ffcccc', borderRadius: 16, padding: 32, textAlign: 'center', maxWidth: 500, margin: '60px auto' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: '#e74c3c', marginBottom: 12 }}>Account Not Linked</h2>
            <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{error}</p>
            <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => { logout(); navigate('/login'); }}>Back to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-layout">
      {/* Top Bar */}
      <div className="portal-topbar">
        <div className="brand">
          <span style={{ fontSize: 26 }}>🦜</span>
          <div>
            <h2>Parrot <span style={{ color: 'var(--orange)' }}>Restaurant</span></h2>
            <div className="sub">{profile?.name || user.name}</div>
          </div>
        </div>
        <div className="right">
          {profile && (
            <div style={{ textAlign: 'right', fontSize: 12 }}>
              <button 
                 onClick={toggleZeroWaste} 
                 style={{ background: profile.isZeroWaste ? '#2ecc71' : '#888', color: 'white', border: 'none', padding: '5px 12px', borderRadius: 20, cursor: 'pointer', marginBottom: 6, fontWeight: 'bold' }}
              >
                 ♻️ Zero-Waste {profile.isZeroWaste ? 'ON' : 'OFF'}
              </button>
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>📍 {profile.location}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)' }}>Open until {profile.openUntil}</div>
            </div>
          )}
          <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.15)' }} />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>👋 {user.name}</span>
          <button className="btn-outline btn-sm" onClick={doLogout}>Logout</button>
        </div>
      </div>

      <div className="portal-content">
        {/* Stats */}
        <div className="del-stats">
          <div className="del-stat">
            <div className="num" style={{ color: '#3498db' }}>{counts.confirmed || 0}</div>
            <div className="lbl">Awaiting Action</div>
          </div>
          <div className="del-stat">
            <div className="num" style={{ color: '#9b59b6' }}>{counts.preparing || 0}</div>
            <div className="lbl">Preparing</div>
          </div>
          <div className="del-stat">
            <div className="num" style={{ color: '#27ae60' }}>{counts.ready || 0}</div>
            <div className="lbl">Ready for Pickup</div>
          </div>
          <div className="del-stat">
            <div className="num" style={{ color: 'var(--orange)' }}>{menu.length}</div>
            <div className="lbl">Menu Items</div>
          </div>
        </div>

        {/* Main tab switcher */}
        <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
          <button
            className={mainTab === 'orders' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setMainTab('orders')}
          >
            📋 Orders
            {counts.confirmed > 0 && (
              <span style={{ background: '#e74c3c', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 8 }}>
                {counts.confirmed}
              </span>
            )}
          </button>
          <button
            className={mainTab === 'menu' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setMainTab('menu')}
          >
            🍽️ Manage Menu
          </button>
          <button
            className={mainTab === 'requests' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setMainTab('requests')}
          >
            📝 Menu Requests
            {menuRequests.length > 0 && (
              <span style={{ background: '#e74c3c', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 8 }}>
                {menuRequests.length}
              </span>
            )}
          </button>
          <button
            className={mainTab === 'bids' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setMainTab('bids')}
          >
            ⚖️ Live Bids
            {bids.length > 0 && (
              <span style={{ background: '#e74c3c', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 8 }}>
                {bids.length}
              </span>
            )}
          </button>
          <button
            className={mainTab === 'features' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setMainTab('features')}
          >
            ✨ Features
          </button>
          <button className="btn-outline btn-sm" onClick={load} style={{ marginLeft: 'auto' }}>🔄 Refresh</button>
        </div>

        {/* ══ ORDERS TAB ══════════════════════════════════════════ */}
        {mainTab === 'orders' && (
          <>
            <div className="portal-header"><h1>📋 Incoming Orders</h1></div>
            <div className="status-tabs">
              {ORDER_TABS.map(t => (
                <button key={t} className={'status-tab ' + (orderTab === t ? 'active' : '')} onClick={() => setOrderTab(t)}>
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
                <div className="emoji">📭</div>
                <h3>No orders here</h3>
                <p>{orderTab === 'confirmed' ? 'New orders from admin will appear here' : 'No orders in this stage'}</p>
              </div>
            ) : filtered.map(order => (
              <div key={order._id} className={'order-card ' + order.status}>
                <div className="order-card-header">
                  <div className="order-id-block">
                    <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                    <p>{new Date(order.createdAt).toLocaleString()} · 👤 {order.user?.name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--orange)' }}>₹{order.totalAmount}/-</div>
                    <span style={{ background: STATUS_COLOR[order.status] + '20', color: STATUS_COLOR[order.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                </div>

                <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🍽️ Order Items</div>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                      <span>{item.quantity}x {item.name}</span>
                      <span style={{ color: 'var(--orange)', fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px dashed #ddd', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--orange)' }}>₹{order.totalAmount}</span>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
                  📍 Deliver to: {order.deliveryAddress || 'SRM University, Potheri'}
                </div>

                <div className="order-actions">
                  {order.status === 'confirmed' && (<>
                    <button className="btn-green" onClick={() => doAction(order._id, 'preparing')}>👨‍🍳 Start Preparing</button>
                    <button className="btn-red"   onClick={() => { setRejectModal(order._id); setRejectNote(''); }}>❌ Reject Order</button>
                  </>)}
                  {order.status === 'preparing' && (
                    <button className="btn-blue" onClick={() => doAction(order._id, 'ready')}>✅ Mark Food Ready</button>
                  )}
                  {order.status === 'ready' && (
                    <div style={{ fontSize: 13, color: '#27ae60', fontWeight: 600 }}>⏳ Waiting for delivery boy to pick up...</div>
                  )}
                  {order.status === 'rejected_restaurant' && (
                    <div style={{ fontSize: 13, color: '#e74c3c' }}>❌ Rejected — {order.rejectionNote}</div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ══ BIDS TAB ════════════════════════════════════════════ */}
        {mainTab === 'bids' && (
          <>
            <div className="portal-header">
              <h1>⚖️ Reverse Bidding</h1>
              <span style={{ fontSize: 13, color: '#666' }}>Users are looking for custom food</span>
            </div>
            {bids.length === 0 ? (
               <div className="empty-state">
                 <div className="emoji">⚖️</div>
                 <h3>No active bids</h3>
               </div>
            ) : bids.map(b => (
               <div key={b._id} style={{ background: '#fff', padding: 20, borderRadius: 10, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--card-shadow)' }}>
                 <div>
                   <div style={{ fontSize: 18, fontWeight: 'bold' }}>Requests: {b.description}</div>
                   <div style={{ color: '#666' }}>Max Budget: <b style={{color:'var(--orange)'}}>₹{b.budget}</b> | By: {b.userId?.name}</div>
                   {b.dietaryNotes && <div style={{ fontSize: 12, color: '#e74c3c' }}>Note: {b.dietaryNotes}</div>}
                 </div>
                 <button onClick={() => acceptBid(b._id)} style={{ background: '#00cc66', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
                   Accept & Prepare
                 </button>
               </div>
            ))}
          </>
        )}

        {/* ══ MENU TAB ════════════════════════════════════════════ */}
        {mainTab === 'menu' && (
          <>
            <div className="portal-header">
              <h1>🍽️ Menu Management</h1>
              <span style={{ fontSize: 13, color: '#666' }}>{menu.length} items in your menu</span>
            </div>

            {/* Menu item grid */}
            {loading ? (
              <div className="loading">🦜</div>
            ) : menu.length === 0 ? (
              <div className="empty-state">
                <div className="emoji">🍽️</div>
                <h3>No menu items yet</h3>
                <p>Contact admin to add items to your menu</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
                marginBottom: 24
              }}>
                {menu.map(item => (
                  <div key={item._id} style={{
                    background: 'white',
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    border: '1px solid #f0f0f0',
                    transition: 'box-shadow 0.2s'
                  }}>
                    {/* Item image */}
                    <div style={{ height: 140, background: '#f8f9fa', position: 'relative', overflow: 'hidden' }}>
                      {item.image ? (
                        <img
                          src={resolveUrl(item.image)}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 40 }}>🍽️</div>
                      )}
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        background: item.available !== false ? '#27ae60' : '#e74c3c',
                        color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
                      }}>
                        {item.available !== false ? 'Available' : 'Unavailable'}
                      </div>
                    </div>

                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                      {item.category && <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>📂 {item.category}</div>}
                      {item.description && <div style={{ fontSize: 12, color: '#666', marginBottom: 8, lineHeight: 1.4 }}>{item.description}</div>}
                      {item.ingredients && item.ingredients.length > 0 && (
                        <div style={{ fontSize: 11, color: '#9b59b6', marginBottom: 8 }}>
                          🥬 {item.ingredients.map(i => i.name).join(', ')}
                        </div>
                      )}
                      <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--orange)' }}>₹{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {mainTab === 'requests' && (
          <MenuRequestsTab 
            requests={menuRequests} 
            reload={load}
          />
        )}
        
        {/* ══ FEATURES TAB ══════════════════════════════════════════ */}
        {mainTab === 'features' && (
          <RestaurantFeaturesTab profile={profile} reload={load} />
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setRejectModal(null)}>
          <div className="modal-box">
            <h2 style={{ color: '#e74c3c' }}>❌ Reject Order</h2>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>Reason (optional):</p>
            <textarea
              className="reject-note"
              placeholder="e.g. Item not available, closing soon..."
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn-red" onClick={doReject}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
