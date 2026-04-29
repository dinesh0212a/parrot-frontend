import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';

const BLANK_BOY  = { name:'', email:'', password:'', phone:'', vehicle:'' };
const BLANK_REST = { name:'', email:'', password:'', restaurantId:'' };

export default function AdminStaff() {
  const [deliveryBoys, setDeliveryBoys]   = useState([]);
  const [restAccounts, setRestAccounts]   = useState([]);
  const [restaurants, setRestaurants]     = useState([]);
  const [tab, setTab]                     = useState('delivery');
  const [modal, setModal]                 = useState(null); // 'delivery' | 'restaurant'
  const [boyForm, setBoyForm]             = useState(BLANK_BOY);
  const [restForm, setRestForm]           = useState(BLANK_REST);

  const load = () => Promise.all([
    api.get('/admin/delivery-boys'),
    api.get('/admin/restaurant-accounts'),
    api.get('/admin/restaurants')
  ]).then(([d, r, res]) => { setDeliveryBoys(d.data); setRestAccounts(r.data); setRestaurants(res.data); });

  useEffect(() => { load(); }, []);

  const saveBoy = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/delivery-boys', boyForm);
      toast.success('🏍️ Delivery boy added!'); setModal(null); setBoyForm(BLANK_BOY); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const saveRest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/restaurant-accounts', restForm);
      toast.success('🏪 Restaurant account created!'); setModal(null); setRestForm(BLANK_REST); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this staff account?')) return;
    await api.delete(`/admin/staff/${id}`); toast.success('Deleted'); load();
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>🪪 Staff & Accounts</h1>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-primary" onClick={() => { setModal('delivery'); setBoyForm(BLANK_BOY); }}>+ Delivery Boy</button>
            <button className="btn-outline" onClick={() => { setModal('restaurant'); setRestForm(BLANK_REST); }}>+ Restaurant Account</button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="status-tabs" style={{ marginBottom: 24 }}>
          <button className={`status-tab ${tab==='delivery'?'active':''}`} onClick={() => setTab('delivery')}>
            🏍️ Delivery Boys ({deliveryBoys.length})
          </button>
          <button className={`status-tab ${tab==='restaurant'?'active':''}`} onClick={() => setTab('restaurant')}>
            🏪 Restaurant Accounts ({restAccounts.length})
          </button>
        </div>

        {tab === 'delivery' && (
          <div className="admin-table">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Vehicle</th><th>Action</th></tr></thead>
              <tbody>
                {deliveryBoys.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign:'center', padding:30, color:'#888' }}>No delivery boys yet. Click "+ Delivery Boy" to add one.</td></tr>
                ) : deliveryBoys.map((b, i) => (
                  <tr key={b._id}>
                    <td>{i+1}</td>
                    <td><strong>🏍️ {b.name}</strong></td>
                    <td>{b.email}</td>
                    <td>{b.phone || '—'}</td>
                    <td>{b.vehicle || '—'}</td>
                    <td><button className="btn-danger" onClick={() => del(b._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'restaurant' && (
          <div className="admin-table">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Linked Restaurant</th><th>Action</th></tr></thead>
              <tbody>
                {restAccounts.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign:'center', padding:30, color:'#888' }}>No restaurant accounts yet.</td></tr>
                ) : restAccounts.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i+1}</td>
                    <td><strong>🏪 {r.name}</strong></td>
                    <td>{r.email}</td>
                    <td>{r.restaurantId?.name || <span style={{ color:'#e74c3c' }}>Not linked</span>}</td>
                    <td><button className="btn-danger" onClick={() => del(r._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Delivery Boy Modal */}
      {modal === 'delivery' && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div className="modal-box">
            <h2>🏍️ Add Delivery Boy</h2>
            <form onSubmit={saveBoy}>
              <div className="form-row">
                <div className="form-group"><label>Full Name *</label><input value={boyForm.name} onChange={e=>setBoyForm({...boyForm,name:e.target.value})} required /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={boyForm.email} onChange={e=>setBoyForm({...boyForm,email:e.target.value})} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Password *</label><input type="password" value={boyForm.password} onChange={e=>setBoyForm({...boyForm,password:e.target.value})} required /></div>
                <div className="form-group"><label>Phone</label><input value={boyForm.phone} onChange={e=>setBoyForm({...boyForm,phone:e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Vehicle (e.g. Bike - TN01AB1234)</label><input value={boyForm.vehicle} onChange={e=>setBoyForm({...boyForm,vehicle:e.target.value})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Delivery Boy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Restaurant Account Modal */}
      {modal === 'restaurant' && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div className="modal-box">
            <h2>🏪 Create Restaurant Account</h2>
            <p style={{ fontSize:13, color:'#888', marginBottom:20 }}>This account will let the restaurant manager log in and manage their orders.</p>
            <form onSubmit={saveRest}>
              <div className="form-row">
                <div className="form-group"><label>Manager Name *</label><input value={restForm.name} onChange={e=>setRestForm({...restForm,name:e.target.value})} required /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={restForm.email} onChange={e=>setRestForm({...restForm,email:e.target.value})} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Password *</label><input type="password" value={restForm.password} onChange={e=>setRestForm({...restForm,password:e.target.value})} required /></div>
                <div className="form-group">
                  <label>Link to Restaurant *</label>
                  <select value={restForm.restaurantId} onChange={e=>setRestForm({...restForm,restaurantId:e.target.value})} required style={{ width:'100%', padding:'14px 16px', border:'2px solid #e8e8e8', borderRadius:12, fontSize:14, fontFamily:'Poppins,sans-serif', outline:'none' }}>
                    <option value="">Select Restaurant...</option>
                    {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
