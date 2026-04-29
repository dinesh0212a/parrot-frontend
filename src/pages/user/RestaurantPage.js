import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function RestaurantPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [ingModal, setIngModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [excluded, setExcluded] = useState([]);
  const { cart, cartRestaurant, addToCart, removeFromCart, clearCart, total, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/restaurants/${id}`).then(res => {
      setRestaurant(res.data);
      setLoading(false);
    });
  }, [id]);

  const categories = restaurant ? ['All', ...new Set(restaurant.menu.map(i => i.category))] : [];
  const filteredMenu = restaurant?.menu.filter(item =>
    activeCategory === 'All' || item.category === activeCategory
  ) || [];

  const getQty = (itemId) => cart.find(i => i._id === itemId)?.qty || 0;

  const applyCoupon = () => {
    const couponMap = { 'CARROT': 14, 'MCDONALDS40': 40, 'BK20': 20, 'KFC17': 17 };
    if (couponMap[coupon.toUpperCase()]) {
      setDiscount(couponMap[coupon.toUpperCase()]);
      toast.success(`🎉 Coupon applied! ${couponMap[coupon.toUpperCase()]}% off`);
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const isZeroWaste = restaurant?.isZeroWaste;
  const foodCost = isZeroWaste ? (total / 2) : total;


  const handleSaveRoutine = async () => {
    if (itemCount === 0) return toast.error('Your cart is empty!');
    const strTime = prompt('What time should we remind you? (e.g. 08:00 AM)');
    if (!strTime) return;
    
    try {
      await api.post('/routines', {
        restaurant: restaurant._id,
        items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.qty, image: i.image })),
        triggerTime: strTime
      });
      toast.success('Routine saved!');
    } catch {
      toast.error('Failed to save routine.');
    }
  };

  if (loading) return <div><Navbar /><div className="loading">🦜</div></div>;
  if (!restaurant) return <div><Navbar /><div className="empty-state"><div className="emoji">😢</div><h3>Restaurant not found</h3></div></div>;

  const discountAmount = Math.round(foodCost * discount / 100);
  const cartFromThisRestaurant = cartRestaurant?._id === restaurant._id;

  const handleAddPress = (item) => {
    if (cartRestaurant && cartRestaurant._id !== restaurant._id) {
      if (!window.confirm('Different Restaurant. Clear your current cart to order from this restaurant?')) return;
      clearCart();
    }
    setSelectedItem(item);
    setIngModal(true);
    setExcluded([]);
  };

  const toggleExcluded = (name) => {
    setExcluded(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleIngredientConfirm = () => {
    setIngModal(false);
    if (selectedItem) {
      addToCart({ ...selectedItem, excludedIngredients: excluded }, restaurant);
      toast.success(`✅ Added to cart! ${excluded.length > 0 ? `(${excluded.length} ingredient(s) removed)` : ''}`);
    }
  };

  const handleCheckout = async () => {
    if (itemCount === 0) return toast.error('Your cart is empty!');
    const finalAmount = foodCost - discountAmount + 40; // +40 delivery fee
    try {
      const order = await api.post('/orders', {
        restaurantId: restaurant._id,
        items: cart.map(i => ({
          menuItemId: i._id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          excludedIngredients: i.excludedIngredients || []
        })),
        totalAmount: finalAmount,
        discount: discountAmount,
        couponCode: coupon,
      });
      clearCart();
      toast.success('🎉 Order placed successfully!');
      navigate(`/track/${order.data._id}`);
    } catch {
      toast.error('Failed to place order. Please login again.');
    }
  };

  return (
    <div>
      <Navbar />

      {/* Ingredient Modal */}
      {ingModal && selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--card-bg)', width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: 20, fontWeight: 800 }}>🥗 Customise Your Order</h2>
            <p style={{ textAlign: 'center', color: '#888', marginBottom: 16 }}>{selectedItem.name}</p>

            {selectedItem.ingredients && selectedItem.ingredients.length > 0 ? (
              <>
                {selectedItem.ingredients.filter(i => !i.optional).length > 0 && (
                  <>
                    <h4 style={{ color: 'var(--orange)', marginTop: 10, marginBottom: 6 }}>📌 Always included</h4>
                    {selectedItem.ingredients.filter(i => !i.optional).map(ing => (
                      <div key={ing.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(0,0,0,0.1)', borderRadius: 8, marginBottom: 6, opacity: 0.6 }}>
                        <span>{ing.name}</span>
                        <span style={{ fontSize: 11 }}>Fixed</span>
                      </div>
                    ))}
                  </>
                )}
                
                {selectedItem.ingredients.filter(i => i.optional).length > 0 && (
                  <>
                    <h4 style={{ color: 'var(--orange)', marginTop: 10, marginBottom: 6 }}>✂️ Tap to remove</h4>
                    {selectedItem.ingredients.filter(i => i.optional).map(ing => {
                      const isExcluded = excluded.includes(ing.name);
                      return (
                        <div 
                          key={ing.name}
                          onClick={() => toggleExcluded(ing.name)}
                          style={{
                            display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                            background: isExcluded ? '#2c1a1a' : 'var(--dark)',
                            border: isExcluded ? '1px solid #e74c3c' : '1px solid transparent'
                          }}
                        >
                          <span style={{ color: isExcluded ? '#e74c3c' : 'var(--white)', textDecoration: isExcluded ? 'line-through' : 'none' }}>
                            {isExcluded ? '❌ ' : '✅ '} {ing.name}
                          </span>
                          {isExcluded && <span style={{ color: '#e74c3c', fontSize: 11, fontWeight: 700 }}>Removed</span>}
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            ) : (
              <p style={{ textAlign: 'center', color: '#888', margin: '20px 0' }}>No ingredient info available for this item.</p>
            )}

            {excluded.length > 0 && (
              <div style={{ background: '#2c1a1a', borderRadius: 8, padding: 10, marginTop: 12 }}>
                <span style={{ color: '#e74c3c', fontSize: 13 }}>Excluding: {excluded.join(', ')}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setIngModal(false)} style={{ flex: 1, padding: 14, borderRadius: 10, background: 'transparent', border: '1px solid #555', color: 'white' }}>Cancel</button>
              <button onClick={handleIngredientConfirm} style={{ flex: 2, padding: 14, borderRadius: 10, background: 'var(--orange)', border: 'none', color: 'white', fontWeight: 800 }}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Hero */}
      <div className="rest-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ fontSize: 72 }}>
            {{ "McDonald's": '🍔', 'Burger King': '👑', 'KFC': '🍗', 'Pizza Hut': '🍕', "Domino's": '🍕', 'StarBucks': '☕' }[restaurant.name] || restaurant.emoji || '🍽️'}
          </div>
          <div>
            <h1>{restaurant.name}</h1>
            <p>{restaurant.description}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 13 }}>
                ⭐ {restaurant.rating}
              </span>
              <span style={{ background: 'var(--orange)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                -{restaurant.discount}% OFF
              </span>
              {restaurant.isZeroWaste && (
                <span style={{ background: '#2ecc71', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, color: 'white', marginLeft: 8 }}>
                  ♻️ Zero Waste Flash 50% OFF
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="rest-info-bar">
        <div className="info-item"><i className="fas fa-clock"></i> Open until {restaurant.openUntil || '11:00 PM'}</div>
        <div className="info-item"><i className="fas fa-motorcycle"></i> Delivery in {restaurant.deliveryTime}</div>
        <div className="info-item"><i className="fas fa-rupee-sign"></i> Min Order: ₹{restaurant.minOrder}</div>
        <div className="info-item"><i className="fas fa-map-marker-alt"></i> {restaurant.address || restaurant.location || 'Unknown'}</div>
      </div>

      {/* Category Tabs */}
      <div style={{ background: 'white', padding: '16px 40px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 18px', borderRadius: 20, border: '2px solid', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Poppins, sans-serif',
              borderColor: activeCategory === cat ? 'var(--orange)' : '#e0e0e0',
              background: activeCategory === cat ? 'var(--orange)' : 'transparent',
              color: activeCategory === cat ? 'white' : '#555',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="rest-layout">
        {/* Menu */}
        <div>
          <div className="menu-section">
            <h3>{activeCategory === 'All' ? restaurant.name + ' Menu' : activeCategory}</h3>
            {filteredMenu.map(item => {
              const qty = getQty(item._id);
              return (
                <div key={item._id} className="menu-item-card">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="menu-item-img" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'; }} />
                  ) : (
                    <div style={{ fontSize: 40, marginRight: 15 }}>{item.emoji || '🍽️'}</div>
                  )}
                  <div className="menu-item-info">
                    <div className="menu-item-name">{item.name}</div>
                    {item.description && <div className="menu-item-desc">{item.description}</div>}
                    <div className="menu-item-price">
                       {restaurant.isZeroWaste ? (
                         <>
                           <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 5 }}>₹{item.price}/-</span>
                           <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>₹{item.price / 2}/-</span>
                         </>
                       ) : `₹${item.price}/-`}
                    </div>
                    {item.ingredients && item.ingredients.length > 0 && (
                      <div style={{ fontSize: 11, color: '#2ecc71', marginTop: 4 }}>🥗 {item.ingredients.length} ingredients • customisable</div>
                    )}
                  </div>
                  {qty === 0 ? (
                    <button className="add-btn" onClick={() => handleAddPress(item)}>+ Add</button>
                  ) : (
                    <div className="qty-controls">
                      <button onClick={() => removeFromCart(item._id)}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{qty}</span>
                      <button className="plus" onClick={() => handleAddPress(item)}>+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reviews */}
          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: 'var(--dark)' }}>Customer Reviews</h3>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: 'var(--card-shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Customer {String.fromCharCode(65 + i)}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>Recent Order</div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: '#f39c12' }}>
                    {'⭐'.repeat(Math.round(restaurant.rating || 4))}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
                  Great food, prompt delivery, and matched my expectations completely. Will order again!
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div>
          <div className="cart-widget">
            <h3>🛒 My Basket</h3>
            {!cartFromThisRestaurant || cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#ccc' }}>
                <div style={{ fontSize: 40 }}>🛒</div>
                <p style={{ marginTop: 10, fontSize: 13 }}>Your cart is empty</p>
              </div>
            ) : (
              <>
                {cart.map((item, idx) => (
                  <div key={item._id + idx} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.qty}x {item.name}</div>
                      {item.excludedIngredients && item.excludedIngredients.length > 0 && (
                        <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 2 }}>❌ No {item.excludedIngredients.join(', ')}</div>
                      )}
                      <div className="cart-item-price">₹{item.price}/- each</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--orange)', fontSize: 14 }}>₹{item.price * item.qty}/-</div>
                  </div>
                ))}
                <div className="coupon-box">
                  <input placeholder="Apply Coupon Code" value={coupon} onChange={e => setCoupon(e.target.value)} />
                  <button className="btn-primary btn-sm" onClick={applyCoupon}>Apply</button>
                </div>
                <div className="cart-summary">
                  <div className="cart-row">
                    <span>Sub Total</span>
                    <span>
                      {isZeroWaste ? (
                         <span style={{color: '#2ecc71'}}>₹{foodCost}/- (50% Off)</span>
                      ) : `₹${total}/-`}
                    </span>
                  </div>
                  <div className="cart-row"><span>Delivery Fee</span><span>₹40/-</span></div>
                  {discount > 0 && <div className="cart-row" style={{ color: 'var(--green)' }}><span>Discount ({discount}%)</span><span>-₹{discountAmount}/-</span></div>}
                  <div className="cart-row total"><span>Total to Pay</span><span>₹{foodCost - discountAmount + 40}/-</span></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    <div>🚚 Delivery: Starts at 17:50</div>
                    <div>🏃 Collection: Starts at 16:50</div>
                  </div>
                </div>
                <button className="btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={handleCheckout}>
                  Checkout! ({itemCount} items)
                </button>
                <button className="btn-secondary" style={{ width: '100%', marginTop: 8, background: '#555', color: 'white', border: 'none', padding: '12px' }} onClick={handleSaveRoutine}>
                  🔮 Save as Daily Routine
                </button>
              </>
            )}
          </div>

          {/* Offers */}
          {restaurant.discount > 0 && (
            <div style={{ background: 'white', borderRadius: 20, padding: 24, marginTop: 20, boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🎁 Special Offer</h3>
              <div style={{ background: 'var(--light-bg)', borderRadius: 12, padding: 16, borderLeft: '4px solid var(--orange)' }}>
                <div style={{ fontWeight: 700, color: 'var(--orange)', fontSize: 20 }}>-{restaurant.discount}%</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>First Order Discount</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Use code: CARROT</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
