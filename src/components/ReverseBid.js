import { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function ReverseBid() {
  const [craving, setCraving] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!craving || !maxBudget) return toast.error('Fill all fields');
    
    setLoading(true);
    try {
      await api.post('/bids', { craving, maxBudget: Number(maxBudget) });
      toast.success('⚖️ Bid Broadcasted! Waiting for a restaurant to accept.');
      setCraving('');
      setMaxBudget('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to broadcast Bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deals-section" style={{ marginTop: '20px', background: '#f8f9fa', border: '2px dashed #ccc', padding: '30px', borderRadius: '15px' }}>
      <div className="deals-title">⚖️ Reverse Bidding ("Name Your Price")</div>
      <p style={{ marginBottom: '15px', color: '#555' }}>Broadcast your cravings to all local restaurants. If a kitchen manager agrees to your maximum budget, they'll accept it and instantly start preparing your food!</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="What are you craving? (e.g. Spicy Chicken Sub)" 
          value={craving} 
          onChange={e => setCraving(e.target.value)}
          style={{ flex: 2, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', minWidth: '250px' }}
        />
        <input 
          type="number" 
          placeholder="Max Budget (₹)" 
          value={maxBudget} 
          onChange={e => setMaxBudget(e.target.value)}
          style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', minWidth: '120px' }}
        />
        <button 
          type="submit"
          disabled={loading}
          style={{ padding: '12px 24px', background: '#00cc66', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Broadcasting...' : 'Broadcast Bid'}
        </button>
      </form>
    </div>
  );
}
