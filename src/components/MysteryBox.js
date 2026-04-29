import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function MysteryBox() {
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSurprise = async () => {
    if (!budget || isNaN(budget) || Number(budget) < 100) {
      return toast.error('Please enter a valid budget (Min ₹100)');
    }
    setLoading(true);
    try {
      const { data } = await api.post('/orders/mystery-box', { budget: Number(budget) });
      toast.success('🎲 Mystery Box Ordered!');
      navigate(`/track/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to order Mystery Box');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deals-section" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: 'white', padding: '30px', borderRadius: '15px' }}>
      <div className="deals-title" style={{ color: 'white' }}>🎲 Food Roulette / Mystery Box</div>
      <p style={{ marginBottom: '15px', opacity: 0.9 }}>Can't decide what to eat? Enter your budget and we'll secretly pick a highly-rated restaurant, compile a random menu just for you, and place the order instantly!</p>
      
      <div style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
        <input 
          type="number" 
          placeholder="Enter Budget (e.g. ₹200)" 
          value={budget} 
          onChange={e => setBudget(e.target.value)}
          style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', fontSize: '16px' }}
        />
        <button 
          onClick={handleSurprise} 
          disabled={loading}
          style={{ padding: '12px 24px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Rolling...' : 'Surprise Me!'}
        </button>
      </div>
    </div>
  );
}
