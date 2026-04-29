import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';

const BLANK = {
  name: '', description: '', category: 'Burgers & Fast food',
  location: '', deliveryTime: '20-25 mins', minOrder: 200,
  rating: 4.0, discount: 0, openUntil: '11:00 PM', image: '', isActive: true
};
const BLANK_MENU = { name: '', price: '', category: '', description: '', image: '', ingredients: '', available: true };

function ImageUploadField({ label, value, onChange }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');

  useEffect(() => { setPreview(value || ''); }, [value]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.url;
      setPreview(url);
      onChange(url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const resolveUrl = (url) =>
    url && url.startsWith('/uploads') ? `http://localhost:5000${url}` : url;

  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={preview}
          onChange={e => { setPreview(e.target.value); onChange(e.target.value); }}
          placeholder="Paste URL or upload a file"
          style={{ flex: 1, minWidth: 180 }}
        />
        <button
          type="button"
          className="btn-outline btn-sm"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          style={{ whiteSpace: 'nowrap' }}
        >
          {uploading ? '⏳ Uploading…' : '📁 Upload'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>
      {preview && (
        <img
          src={resolveUrl(preview)}
          alt="preview"
          style={{ marginTop: 8, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
    </div>
  );
}

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [modal, setModal] = useState(false);
  const [menuModal, setMenuModal] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [menuForm, setMenuForm] = useState(BLANK_MENU);
  const [editId, setEditId] = useState(null);
  const [editMenuId, setEditMenuId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Added for Menu Requests Feature
  const [activeTab, setActiveTab] = useState('restaurants');
  const [menuRequests, setMenuRequests] = useState([]);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/restaurants'),
      api.get('/admin/menu-requests').catch(() => ({ data: [] }))
    ]).then(([restRes, reqRes]) => {
      setRestaurants(restRes.data);
      setMenuRequests(reqRes.data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (menuModal) {
      const updated = restaurants.find(r => r._id === menuModal._id);
      if (updated) setMenuModal(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurants]);

  const openAdd  = () => { setForm(BLANK); setEditId(null); setModal(true); };
  const openEdit = (r) => { setForm({ ...r }); setEditId(r._id); setModal(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put('/admin/restaurants/' + editId, form);
        toast.success('Restaurant updated!');
      } else {
        await api.post('/admin/restaurants', form);
        toast.success('Restaurant added!');
      }
      setModal(false);
      load();
    } catch { toast.error('Failed to save'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this restaurant?')) return;
    await api.delete('/admin/restaurants/' + id);
    toast.success('Deleted!');
    load();
  };

  const saveMenuItem = async (e) => {
    e.preventDefault();
    try {
      const parsedIngredients = menuForm.ingredients 
        ? menuForm.ingredients.split(',').map(i => ({ name: i.trim(), optional: true })).filter(i => i.name)
        : [];
      if (editMenuId) {
        await api.put('/admin/restaurants/' + menuModal._id + '/menu/' + editMenuId, {
          ...menuForm, price: Number(menuForm.price), ingredients: parsedIngredients
        });
        toast.success('Menu item updated!');
      } else {
        await api.post('/admin/restaurants/' + menuModal._id + '/menu', {
          ...menuForm, price: Number(menuForm.price), ingredients: parsedIngredients
        });
        toast.success('Menu item added!');
      }
      setMenuForm(BLANK_MENU);
      setEditMenuId(null);
      load();
    } catch { toast.error('Failed to save menu item'); }
  };

  const startEditMenuItem = (item) => {
    setMenuForm({
      name: item.name,
      price: item.price,
      category: item.category || '',
      description: item.description || '',
      image: item.image || '',
      ingredients: (item.ingredients || []).map(i => i.name).join(', '),
      available: item.available !== false
    });
    setEditMenuId(item._id);
  };

  const cancelMenuEdit = () => { setMenuForm(BLANK_MENU); setEditMenuId(null); };

  const delMenuItem = async (restId, itemId) => {
    if (!window.confirm('Remove this menu item?')) return;
    await api.delete('/admin/restaurants/' + restId + '/menu/' + itemId);
    toast.success('Menu item removed!');
    load();
  };

  const approveMenuReq = async (id) => {
    try {
      await api.put('/admin/menu-requests/' + id + '/approve');
      toast.success('Approved and added directly to menu!');
      load();
    } catch { toast.error('Failed to approve'); }
  };

  const rejectMenuReq = async (id) => {
    try {
      await api.put('/admin/menu-requests/' + id + '/reject');
      toast.success('Request rejected');
      load();
    } catch { toast.error('Failed to reject'); }
  };

  const f  = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const mf = (key, val) => setMenuForm(prev => ({ ...prev, [key]: val }));

  const resolveUrl = (url) =>
    url && url.startsWith('/uploads') ? 'http://localhost:5000' + url : url;

  const currentMenuItems = menuModal
    ? (restaurants.find(r => r._id === menuModal._id)?.menu || [])
    : [];

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>🏪 Restaurants</h1>
          <button className="btn-primary" onClick={openAdd}>+ Add Restaurant</button>
        </div>

        <div className="status-tabs" style={{ marginBottom: 20 }}>
          <button className={`status-tab ${activeTab === 'restaurants' ? 'active' : ''}`} onClick={() => setActiveTab('restaurants')}>Restaurants</button>
          <button className={`status-tab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            Menu Requests
            {menuRequests.filter(r => r.status === 'pending').length > 0 && (
              <span style={{ background: '#e74c3c', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 8 }}>
                {menuRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {loading ? <div className="loading">🦜</div> : activeTab === 'restaurants' ? (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Category</th><th>Location</th>
                  <th>Rating</th><th>Discount</th><th>Status</th>
                  <th>Menu Items</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {r.image && (
                          <img
                            src={resolveUrl(r.image)}
                            alt={r.name}
                            style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <strong>{r.name}</strong>
                      </div>
                    </td>
                    <td>{r.category}</td>
                    <td>{r.location}</td>
                    <td>⭐ {r.rating}</td>
                    <td>{r.discount > 0 ? <span className="badge badge-orange">-{r.discount}%</span> : '—'}</td>
                    <td><span className={`badge ${r.isActive ? 'badge-green' : 'badge-red'}`}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>{r.menu?.length || 0} items</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-primary btn-sm" onClick={() => openEdit(r)}>Edit</button>
                      <button className="btn-outline btn-sm" onClick={() => { setMenuModal(r); setMenuForm(BLANK_MENU); setEditMenuId(null); }}>Menu</button>
                      <button className="btn-danger" onClick={() => del(r._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-table">
            <table style={{width: '100%'}}>
              <thead>
                <tr>
                  <th>Image</th><th>Item Name</th><th>Restaurant</th><th>Price</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuRequests.map(r => (
                  <tr key={r._id}>
                     <td>
                       {r.image && <img src={resolveUrl(r.image)} alt="" style={{width: 36, height: 36, borderRadius: 4, objectFit: 'cover'}} />}
                     </td>
                     <td><strong>{r.itemName}</strong><br/><small style={{color:'#666'}}>{r.category} - {r.description}</small></td>
                     <td>{r.restaurantName}</td>
                     <td>₹{r.price}</td>
                     <td><span className={`badge ${r.status === 'approved' ? 'badge-green' : r.status === 'rejected' ? 'badge-red' : 'badge-orange'}`}>{r.status.toUpperCase()}</span></td>
                     <td>
                       {r.status === 'pending' && (
                         <div style={{display:'flex', gap: 6}}>
                           <button className="btn-green btn-sm" onClick={() => approveMenuReq(r._id)}>Approve</button>
                           <button className="btn-red btn-sm" onClick={() => rejectMenuReq(r._id)}>Reject</button>
                         </div>
                       )}
                     </td>
                  </tr>
                ))}
                {menuRequests.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding: 20}}>No menu requests found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Restaurant Modal */}
        {modal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
            <div className="modal-box" style={{ maxWidth: 640 }}>
              <h2>{editId ? 'Edit Restaurant' : 'Add Restaurant'}</h2>
              <form onSubmit={save}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input value={form.name} onChange={e => f('name', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input value={form.category} onChange={e => f('category', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input value={form.description} onChange={e => f('description', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input value={form.location} onChange={e => f('location', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Delivery Time</label>
                    <input value={form.deliveryTime} onChange={e => f('deliveryTime', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Min Order (₹)</label>
                    <input type="number" value={form.minOrder} onChange={e => f('minOrder', Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label>Rating (0-5)</label>
                    <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => f('rating', Number(e.target.value))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Discount (%)</label>
                    <input type="number" min="0" max="100" value={form.discount} onChange={e => f('discount', Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label>Open Until</label>
                    <input value={form.openUntil} onChange={e => f('openUntil', e.target.value)} />
                  </div>
                </div>
                <ImageUploadField label="Restaurant Image" value={form.image} onChange={url => f('image', url)} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label><input type="checkbox" checked={form.isActive !== false} onChange={e => f('isActive', e.target.checked)} /> Active</label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-outline" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Menu Management Modal */}
        {menuModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setMenuModal(null)}>
            <div className="modal-box" style={{ maxWidth: 780 }}>
              <h2>🍽️ Menu — {menuModal.name}</h2>

              <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16, border: '1px solid #eee', borderRadius: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', position: 'sticky', top: 0 }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>Img</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '10px 8px' }}>Category</th>
                      <th style={{ padding: '10px 8px' }}>Price</th>
                      <th style={{ padding: '10px 8px' }}>Avail.</th>
                      <th style={{ padding: '10px 8px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMenuItems.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#aaa' }}>No menu items yet — add one below</td></tr>
                    ) : currentMenuItems.map(item => (
                      <tr key={item._id} style={{
                        background: editMenuId === item._id ? '#fff8f0' : 'white',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <td style={{ padding: '8px 12px' }}>
                          {item.image ? (
                            <img src={resolveUrl(item.image)} alt={item.name}
                              style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                              onError={e => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍽️</div>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                          {item.name}
                          {item.ingredients && item.ingredients.length > 0 && (
                            <div style={{ fontSize: 11, color: '#9b59b6', fontWeight: 400, marginTop: 4 }}>
                              🥬 {item.ingredients.map(i => i.name).join(', ')}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '8px', color: '#666' }}>{item.category}</td>
                        <td style={{ padding: '8px', fontWeight: 600, color: 'var(--orange)' }}>₹{item.price}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span style={{ background: item.available !== false ? '#e8f5e9' : '#ffeaea', color: item.available !== false ? '#27ae60' : '#e74c3c', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {item.available !== false ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td style={{ padding: '8px', display: 'flex', gap: 5 }}>
                          <button className="btn-primary btn-sm" onClick={() => startEditMenuItem(item)} style={{ fontSize: 12 }}>✏️ Edit</button>
                          <button className="btn-danger" onClick={() => delMenuItem(menuModal._id, item._id)} style={{ fontSize: 12 }}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ background: editMenuId ? '#fff8f0' : '#f8f9fa', borderRadius: 12, padding: 16, border: editMenuId ? '2px solid #f39c12' : 'none' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
                  {editMenuId ? '✏️ Editing Menu Item' : '➕ Add New Item'}
                </h3>
                <form onSubmit={saveMenuItem}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Item Name *</label>
                      <input value={menuForm.name} onChange={e => mf('name', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Price (₹) *</label>
                      <input type="number" value={menuForm.price} onChange={e => mf('price', e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <input value={menuForm.category} onChange={e => mf('category', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <label style={{ marginBottom: 8 }}>Availability</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" checked={menuForm.available !== false} onChange={e => mf('available', e.target.checked)} />
                        <span style={{ fontSize: 13 }}>Available for ordering</span>
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input value={menuForm.description} onChange={e => mf('description', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Ingredients (comma separated)</label>
                    <input value={menuForm.ingredients} onChange={e => mf('ingredients', e.target.value)} placeholder="e.g. Tomato, Cheese" />
                  </div>
                  <ImageUploadField label="Item Image" value={menuForm.image} onChange={url => mf('image', url)} />
                  <div className="modal-actions" style={{ marginTop: 12 }}>
                    <button type="button" className="btn-outline" onClick={() => setMenuModal(null)}>Close</button>
                    {editMenuId && (
                      <button type="button" className="btn-outline" onClick={cancelMenuEdit}>+ Add New Instead</button>
                    )}
                    <button type="submit" className="btn-primary">
                      {editMenuId ? '💾 Save Changes' : '➕ Add Item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
