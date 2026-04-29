import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/offers').then(res => { setOffers(res.data); setLoading(false); });
  }, []);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`✅ Code "${code}" copied to clipboard!`);
  };

  return (
    <div>
      <Navbar />
      <div style={{ background: 'linear-gradient(135deg, var(--dark), #0f3460)', padding: '50px 40px', color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: 40, fontWeight: 800 }}>🎁 Special Offers</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>Exclusive deals just for you!</p>
      </div>

      <section className="section">
        {loading ? (
          <div className="loading">🦜</div>
        ) : (
          <div className="offers-grid">
            {offers.map(offer => (
              <div key={offer._id} className="offer-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div className="offer-title">{offer.title}</div>
                    <div className="offer-restaurant">📍 {offer.restaurantName}</div>
                  </div>
                  <div className="offer-discount">-{offer.discount}%</div>
                </div>
                <div className="offer-desc">{offer.description}</div>
                <div className="offer-code" style={{ cursor: 'pointer' }} onClick={() => copyCode(offer.code)}>
                  {offer.code} <i className="fas fa-copy" style={{ marginLeft: 8, fontSize: 14 }}></i>
                </div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 10 }}>
                  Valid until {new Date(offer.validUntil).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
