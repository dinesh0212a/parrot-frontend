import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartRestaurant, setCartRestaurant] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  const addToCart = (item, restaurant) => {
    if (cartRestaurant && cartRestaurant._id !== restaurant._id) {
      if (!window.confirm('Your cart has items from another restaurant. Clear and add new?')) return;
      setCart([]);
      setCouponCode('');
      setCouponDiscount(0);
    }
    setCartRestaurant(restaurant);
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const updated = prev.map(i => i._id === itemId ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0);
      if (updated.length === 0) {
        setCartRestaurant(null);
        setCouponCode('');
        setCouponDiscount(0);
      }
      return updated;
    });
  };

  const clearCart = () => { 
    setCart([]); 
    setCartRestaurant(null); 
    setCouponCode('');
    setCouponDiscount(0);
  };

  const applyCoupon = (code, discount) => {
    setCouponCode(code);
    setCouponDiscount(discount);
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountAmount = Math.floor(subtotal * (couponDiscount / 100));
  const total = subtotal - discountAmount;
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ 
      cart, cartRestaurant, addToCart, removeFromCart, clearCart, 
      total, itemCount, subtotal,
      couponCode, couponDiscount, applyCoupon, removeCoupon, discountAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
