import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

export default function RoutineBuilderPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState('AM');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch all active restaurants
    api.get('/restaurants').then(res => {
      setRestaurants(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const selectRestaurant = async (rest) => {
    setSelectedRest(rest);
    setSelectedItems([]); // reset items
    try {
      const res = await api.get(`/restaurants/${rest._id}`);
      setSelectedRest(res.data); // getting full restaurant with menu
    } catch {}
  };

  const toggleItem = (item) => {
    if (selectedItems.find(i => i.name === item.name)) {
      setSelectedItems(selectedItems.filter(i => i.name !== item.name));
    } else {
      if (selectedItems.length >= 10) return toast.error('You can select up to 10 items for a routine.');
      setSelectedItems([...selectedItems, { name: item.name, price: item.price, category: item.category, qty: 1 }]);
    }
  };

  const saveRoutine = async () => {
    if (!selectedRest) return toast.error('Please select a restaurant.');
    if (selectedItems.length === 0) return toast.error('Please select at least 1 item.');
    
    const timeToSave = `${hour < 10 ? '0'+hour : hour}:${minute < 10 ? '0'+minute : minute} ${ampm}`;

    setSaving(true);
    try {
      await api.post('/routines', {
        restaurantId: selectedRest._id,
        triggerTime: timeToSave,
        items: selectedItems
      });
      toast.success('Your Zero-Click Predictive Routine has been saved!');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save routine');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page-bg)' }}>
      <div style={{ fontSize: 40, animation: 'spin 1s linear infinite' }}>🦜</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🔮</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#3498db', marginBottom: 12 }}>Predictive Orders</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
          We will build a custom cart automatically everyday.
        </p>
      </div>

      <div style={{ maxWidth: 800, margin: '40px auto 0', padding: '0 20px' }}>
        {!selectedRest ? (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--dark)', marginBottom: 24 }}>Step 1: Choose a Restaurant</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {restaurants.map(r => (
                <button 
                  key={r._id} 
                  onClick={() => selectRestaurant(r)}
                  style={{ width: '100%', background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: 20, borderRadius: 16, display: 'flex', alignItems: 'center', boxShadow: 'var(--card-shadow)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3498db'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🍽️</span> {r.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button 
              onClick={() => setSelectedRest(null)}
              style={{ color: '#3498db', fontWeight: 800, fontSize: 15, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0 }}
            >
              ← Change Restaurant
            </button>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--dark)', marginBottom: 16 }}>Step 2: Select Items (Max 10)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {selectedRest.menu && selectedRest.menu.length > 0 ? (
                selectedRest.menu.map(item => {
                  const isSelected = !!selectedItems.find(i => i.name === item.name);
                  return (
                    <button 
                      key={item._id} 
                      onClick={() => toggleItem(item)}
                      style={{ 
                        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 16, transition: 'all 0.2s', cursor: 'pointer', 
                        background: isSelected ? '#3498db' : 'var(--card-bg)', 
                        border: `1px solid ${isSelected ? '#3498db' : 'var(--border-color)'}`,
                        boxShadow: isSelected ? '0 8px 24px rgba(52,152,219,0.3)' : 'var(--card-shadow)',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                      }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: isSelected ? 'white' : 'var(--dark)' }}>{item.name}</h3>
                        <p style={{ fontSize: 14, marginTop: 4, color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>₹{item.price}</p>
                      </div>
                      {isSelected && <span style={{ fontSize: 24 }}>✅</span>}
                    </button>
                  );
                })
              ) : (
                <p style={{ color: 'var(--text-secondary)', padding: 16 }}>No menu items available.</p>
              )}
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--dark)', marginBottom: 16 }}>Step 3: Trigger Time</h2>
            <div style={{ background: 'var(--card-bg)', padding: 40, borderRadius: 24, boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)', marginBottom: 40, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button onClick={() => setHour(h => h === 12 ? 1 : h + 1)} style={{ padding: 8, color: '#3498db', fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}>▲</button>
                <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--dark)', padding: '8px 0', width: 64, textAlign: 'center' }}>{hour < 10 ? '0'+hour : hour}</div>
                <button onClick={() => setHour(h => h === 1 ? 12 : h - 1)} style={{ padding: 8, color: '#3498db', fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}>▼</button>
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--dark)', paddingBottom: 8 }}>:</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button onClick={() => setMinute(m => m >= 59 ? 0 : m + 1)} style={{ padding: 8, color: '#3498db', fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}>▲</button>
                <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--dark)', padding: '8px 0', width: 64, textAlign: 'center' }}>{minute < 10 ? '0'+minute : minute}</div>
                <button onClick={() => setMinute(m => m <= 0 ? 59 : m - 1)} style={{ padding: 8, color: '#3498db', fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}>▼</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 16 }}>
                <button 
                  onClick={() => setAmpm('AM')} 
                  style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 800, border: '1px solid', transition: 'all 0.2s', cursor: 'pointer', background: ampm === 'AM' ? '#3498db' : 'var(--card-bg)', color: ampm === 'AM' ? 'white' : 'var(--text-secondary)', borderColor: ampm === 'AM' ? '#3498db' : 'var(--border-color)' }}
                >
                  AM
                </button>
                <button 
                  onClick={() => setAmpm('PM')} 
                  style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 800, border: '1px solid', transition: 'all 0.2s', cursor: 'pointer', background: ampm === 'PM' ? '#3498db' : 'var(--card-bg)', color: ampm === 'PM' ? 'white' : 'var(--text-secondary)', borderColor: ampm === 'PM' ? '#3498db' : 'var(--border-color)' }}
                >
                  PM
                </button>
              </div>
            </div>

            <button 
              onClick={saveRoutine} 
              disabled={saving}
              className="btn-blue"
              style={{ width: '100%', padding: '20px', fontSize: 18, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Processing...' : 'Save Routine'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
