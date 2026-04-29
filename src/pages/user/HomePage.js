import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import { getRestaurantImageById } from '../../utils/images';

const CATEGORIES = [
  { name: 'All', icon: '🍽️' },
  { name: 'Burgers & Fast food', icon: '🍔', count: '21 Restaurants' },
  { name: 'Biryani', icon: '🍛', count: '32 Restaurants' },
  { name: 'Pizza', icon: '🍕', count: '32 Restaurants' },
  { name: 'Drinks', icon: '🥤', count: '32 Restaurants' },
  { name: 'Noodles', icon: '🍜', count: '4 Restaurants' },
  { name: 'Breakfast', icon: '🥞', count: '4 Restaurants' },
  { name: 'Home Chefs', icon: '👩‍🍳', count: 'Local Cooking' },
];

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/restaurants'), 
      api.get('/offers'),
      api.get('/stats')
    ]).then(([r, o, s]) => {
      setRestaurants(r.data); 
      setOffers(o.data); 
      setStats(s.data);
      setLoading(false);
    });
  }, []);

  const filtered = restaurants.filter(r => {
    if (activeCategory === 'Home Chefs') {
      return r.isHomeChef === true && r.name.toLowerCase().includes(search.toLowerCase());
    }
    return (activeCategory === 'All' || r.category === activeCategory) &&
           r.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <Navbar />
      <section className="hero">
        <h1>Feast Your Senses,<br /><span>Fast and Fresh</span></h1>
        <p>Order Restaurant food, takeaway and groceries.</p>
        <div className="search-box">
          <i className="fas fa-search" style={{ color: '#ccc' }}></i>
          <input placeholder="Search restaurants, cuisines..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn-primary">Search</button>
        </div>
        <div className="stats-row">
          {stats ? [
            [stats.activeRiders + '+', 'Active Riders'],
            [stats.totalOrders + '+', 'Orders Placed'],
            [stats.activeRestaurants + '+', 'Restaurants & Chefs'],
            [stats.registeredUsers + '+', 'Happy Users']
          ].map(([n,l])=>(
            <div key={l} className="stat-item"><div className="num">{n}</div><div className="label">{l}</div></div>
          )) : (
            <div className="loading" style={{ color: 'white' }}>Loading Live Stats...</div>
          )}
        </div>
      </section>

      {offers.length > 0 && (
        <section className="deals-section">
          <div className="deals-title">⚡ Up to <span>-40%</span> — Parrot Exclusive Deals</div>
          <div className="deals-grid">
            {offers.slice(0, 3).map(o => (
              <div key={o._id} className="deal-card">
                <div className="deal-image"><span style={{ fontSize: 48 }}>🎁</span></div>
                <div className="deal-body">
                  <div className="restaurant-type">Special Offer</div>
                  <div className="restaurant-name">{o.restaurantName}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 8 }}>
                    <span className="deal-badge">-{o.discount}%</span>
                    <span style={{ fontSize:12, color:'#888' }}>Code: <b>{o.code}</b></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-header"><h2 className="section-title">Popular <span>Categories 🤩</span></h2></div>
        <div className="categories-grid">
          {CATEGORIES.map(cat => (
            <div key={cat.name} className={`category-card ${activeCategory===cat.name?'active':''}`} onClick={() => setActiveCategory(cat.name)}>
              <div className="cat-icon">{cat.icon}</div>
              <div className="cat-name">{cat.name}</div>
              {cat.count && <div className="cat-count">{cat.count}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <h2 className="section-title">Popular <span>Restaurants</span></h2>
        </div>
        {loading ? <div className="loading">🦜</div> : filtered.length === 0 ? (
          <div className="empty-state"><div className="emoji">🔍</div><h3>No restaurants found</h3></div>
        ) : (
          <div className="restaurants-grid">
            {filtered.map(r => (
              <div key={r._id} className="restaurant-card" onClick={() => navigate(`/restaurant/${r._id}`)}>
                <div className="rc-image">
                  {r.image ? (
                    <img 
                      src={r.image.startsWith('/uploads') ? `http://localhost:5000${r.image}` : r.image}
                      alt={r.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = getRestaurantImageById(r._id, r.category, 500);
                      }}
                    />
                  ) : (
                    <img 
                      src={getRestaurantImageById(r._id, r.category, 500)}
                      alt={r.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x300?text=Restaurant';
                      }}
                    />
                  )}
                  {r.discount > 0 && <div className="rc-discount">-{r.discount}%</div>}
                  {r.discount > 0 && <div className="rc-discount">-{r.discount}%</div>}
                </div>
                <div className="rc-body">
                  <div className="rc-name">{r.name}</div>
                  <div className="rc-meta">
                    <span className="rating"><i className="fas fa-star"></i> {r.rating}</span>
                    <span><i className="fas fa-clock" style={{ marginRight:4 }}></i>{r.deliveryTime}</span>
                    <span><i className="fas fa-rupee-sign" style={{ marginRight:2 }}></i>{r.minOrder} min</span>
                  </div>
                  <div className="rc-tags">
                    <span className="rc-tag">{r.category}</span>
                    <span className="rc-tag">{r.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="app-section">
        <h2>Ordering is more<br />Personalised & Instant</h2>
        <p>Download the Parrot app for faster ordering</p>
        <div className="app-badges">
          <div className="app-badge"><i className="fab fa-apple"></i><span>App Store</span></div>
          <div className="app-badge"><i className="fab fa-google-play"></i><span>Google Play</span></div>
        </div>
      </div>
      <div className="partner-section">
        <div className="partner-card"><div className="partner-icon">🏪</div><div className="partner-content"><h3>Signup as a business</h3><p>Partner with us — Earn more with lower fees</p><button className="btn-primary btn-sm">Get Started</button></div></div>
        <div className="partner-card"><div className="partner-icon">🏍️</div><div className="partner-content"><h3>Signup as a rider</h3><p>Ride with us — Avail exclusive perks</p><button className="btn-primary btn-sm">Get Started</button></div></div>
      </div>
      <Footer />
    </div>
  );
}
