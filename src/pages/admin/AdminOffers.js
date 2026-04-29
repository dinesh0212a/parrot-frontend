import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';

const BLANK = { title: '', description: '', code: '', discount: 0, restaurantName: 'All Restaurants', validUntil: '', isActive: true };

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);

  const load = () => api.get('/admin/offers').then(res => setOffers(res.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(BLANK); setEditId(null); setModal(true); };
  const openEdit = (o) => { setForm({ ...o, validUntil: o.validUntil?.slice(0, 10) }); setEditId(o._id); setModal(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put(`/admin/offers/${editId}`, form); toast.success('Offer updated!'); }
      else { await api.post('/admin/offers', form); toast.success('Offer created!'); }
      setModal(false); load();
    } catch { toast.error('Failed to save'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    await api.delete(`/admin/offers/${id}`);
    toast.success('Deleted!'); load();
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>🎁 Offers</h1>
          <button className="btn-primary" onClick={openAdd}>+ Add Offer</button>
        </div>

        <div className="admin-table">
          <table>
            <thead>
              <tr><th>Title</th><th>Code</th><th>Discount</th><th>Restaurant</th><th>Valid Until</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {offers.map(o => (
                <tr key={o._id}>
                  <td><strong>{o.title}</strong></td>
                  <td><code style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: 4 }}>{o.code}</code></td>
                  <td><span className="badge badge-orange">-{o.discount}%</span></td>
                  <td>{o.restaurantName}</td>
                  <td>{o.validUntil ? new Date(o.validUntil).toLocaleDateString() : '—'}</td>
                  <td><span className={`badge ${o.isActive ? 'badge-green' : 'badge-red'}`}>{o.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-primary btn-sm" onClick={() => openEdit(o)}>Edit</button>
                    <button className="btn-danger" onClick={() => del(o._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
            <div className="modal-box">
              <h2>{editId ? 'Edit Offer' : 'Add Offer'}</h2>
              <form onSubmit={save}>
                <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => f('title', e.target.value)} required /></div>
                <div className="form-group"><label>Description</label><input value={form.description} onChange={e => f('description', e.target.value)} /></div>
                <div className="form-row">
                  <div className="form-group"><label>Coupon Code</label><input value={form.code} onChange={e => f('code', e.target.value.toUpperCase())} /></div>
                  <div className="form-group"><label>Discount (%)</label><input type="number" min="0" max="100" value={form.discount} onChange={e => f('discount', Number(e.target.value))} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Restaurant</label><input value={form.restaurantName} onChange={e => f('restaurantName', e.target.value)} /></div>
                  <div className="form-group"><label>Valid Until</label><input type="date" value={form.validUntil} onChange={e => f('validUntil', e.target.value)} /></div>
                </div>
                <label><input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} /> Active</label>
                <div className="modal-actions">
                  <button type="button" className="btn-outline" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
