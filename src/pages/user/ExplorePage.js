import React from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: '🎲', title: 'Mystery Box', sub: 'Surprise me within my budget!', path: '/mystery-box', color: '#f39c12', bg: '#fff3e0' },
  { icon: '♻️', title: 'Zero-Waste Flash Sales', sub: 'Grab great food at 50–70% off', path: '/flash-sales', color: '#27ae60', bg: '#e8f8f5' },
  { icon: '⚖️', title: 'Reverse Bid', sub: 'Name your price, restaurants compete', path: '/reverse-bid', color: '#9b59b6', bg: '#f5eef8' },
  { icon: '👩‍🍳', title: 'Home Chef', sub: 'Authentic homemade food nearby', path: '/home-chef', color: '#FF6B35', bg: '#ffeee6' },
  { icon: '🔮', title: 'Predictive Orders', sub: 'Zero-click predictive orders based on habits', path: '/routine-builder', color: '#3498db', bg: '#ebf5fb' },
];

export default function ExplorePage() {
  const navigate = useNavigate();

  return (
    <div className="section" style={{ minHeight: '100vh', background: 'var(--page-bg)', padding: '60px 20px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>Explore ✨</h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32 }}>New ways to discover & order food tailored just for you.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <button
              key={i}
              onClick={() => navigate(f.path)}
              style={{
                width: '100%',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 20,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                boxShadow: 'var(--card-shadow)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
            >
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: f.bg, border: `1px solid ${f.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginRight: 20, flexShrink: 0
              }}>
                <span style={{ fontSize: 32 }}>{f.icon}</span>
              </div>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)', marginBottom: 4 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.sub}</p>
              </div>
              <span style={{ color: f.color, fontWeight: 800, fontSize: 36, opacity: 0.8 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
