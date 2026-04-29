import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const DIET_OPTIONS = ['No Preference', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Jain'];
const COMMON_ALLERGENS = ['Nuts', 'Dairy', 'Gluten', 'Eggs', 'Shellfish', 'Soy'];

export default function MysteryBoxPage() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState('');
  const [diet, setDiet] = useState('No Preference');
  const [allergies, setAllergies] = useState([]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [reveal, setReveal] = useState(null);

  const toggleAllergen = (a) =>
    setAllergies((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const handleSurpriseMe = async () => {
    if (!budget || isNaN(budget) || Number(budget) < 50) {
      return toast.error('Enter a budget of ₹50 or more');
    }
    if (!address.trim()) {
      return toast.error('Please enter your delivery address');
    }
    setLoading(true);
    try {
      const res = await api.post('/features/mystery', {
        budget: Number(budget),
        diet,
        allergies,
        address,
      });
      setReveal(res.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'No Mystery Box available right now');
    } finally {
      setLoading(false);
    }
  };

  if (reveal) {
    return (
      <div className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page-bg)', padding: '20px' }}>
        <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: '40px 20px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '2px solid var(--orange)' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🎲</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>Your Mystery Box!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>From: {reveal.restaurant.emoji} {reveal.restaurant.name}</p>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--orange)', marginBottom: 24, background: 'var(--light-bg)', padding: '12px 20px', borderRadius: 16, display: 'inline-block' }}>🍽️ {reveal.reveal}</div>
          <p style={{ color: 'var(--text-primary)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>{reveal.message}</p>
          <button
            onClick={() => navigate(`/track/${reveal.order._id}`)}
            className="btn-primary"
            style={{ width: '100%', marginBottom: 16, padding: '14px', fontSize: 16 }}
          >
            Track My Order →
          </button>
          <button
            onClick={() => { setReveal(null); setBudget(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--orange)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Order Another Mystery Box
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🎲</div>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Mystery Box</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 12, fontSize: 15, maxWidth: 500, margin: '12px auto 0', lineHeight: 1.6 }}>
          Can't decide? Let us surprise you! A highly-rated restaurant creates a fresh meal from today's best ingredients — within your budget.
        </p>
      </div>

      <div style={{ maxWidth: 600, margin: '40px auto 0', padding: '0 20px' }}>
        <div style={{ background: 'var(--card-bg)', padding: 32, borderRadius: 24, boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 14, color: 'var(--dark)' }}>💰 Your Budget (₹)</label>
            <input
              type="number"
              style={{ width: '100%', padding: '16px', borderRadius: 12, border: '2px solid var(--input-border)', fontSize: 16, background: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none' }}
              placeholder="e.g. 200"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>🥗 Dietary Preference</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DIET_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDiet(d)}
                  style={{
                    padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                    background: diet === d ? 'var(--orange)' : 'var(--card-bg-2)',
                    color: diet === d ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>⚠️ Allergies / Avoid</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COMMON_ALLERGENS.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAllergen(a)}
                  style={{
                    padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                    background: allergies.includes(a) ? '#e74c3c' : 'var(--card-bg-2)',
                    color: allergies.includes(a) ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {allergies.includes(a) ? '✓ ' : ''}{a}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 14, color: 'var(--dark)' }}>📍 Delivery Address</label>
            <textarea
              style={{ width: '100%', padding: '16px', borderRadius: 12, border: '2px solid var(--input-border)', fontSize: 15, background: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none', minHeight: 100, resize: 'vertical' }}
              placeholder="Enter your delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 16, padding: '20px', marginTop: 8 }}>
            <h3 style={{ color: '#27ae60', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>How It Works</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#2e7d32', fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>🍳 Restaurants use overstocked, ultra-fresh ingredients</li>
              <li>♻️ Helps reduce food waste</li>
              <li>🎉 Your meal is a genuine surprise — embrace the adventure!</li>
            </ul>
          </div>

          <button
            onClick={handleSurpriseMe}
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: 18, marginTop: 12, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Processing...' : '🎲 Surprise Me!'}
          </button>
        </div>
      </div>
    </div>
  );
}
