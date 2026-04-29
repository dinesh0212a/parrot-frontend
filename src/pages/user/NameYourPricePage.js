import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

export default function NameYourPricePage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      return toast.error('Please describe what you want.');
    }
    const numPrice = parseInt(maxPrice, 10);
    if (isNaN(numPrice) || numPrice < 10) {
      return toast.error('Please enter a valid amount.');
    }

    setLoading(true);
    try {
      await api.post('/bids', { description, maxPrice: numPrice });
      toast.success('Your order has been broadcasted to local restaurants.');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col pt-12 pb-20 items-center">
      <div className="text-center px-6 max-w-lg mx-auto w-full flex flex-col items-center">
        <div className="text-7xl mb-6 mt-4">⚖️</div>
        <h1 className="text-4xl font-black text-white mb-4">Name Your Price</h1>
        <p className="text-gray-400 text-lg leading-relaxed mb-10 w-full text-center">
          Tell us what you're craving and what you're willing to pay. Local restaurants will compete to accept your bid!
        </p>

        <div className="w-full bg-white rounded-2xl p-2 mb-5">
          <textarea
            className="w-full bg-transparent min-h-[60px] text-gray-900 text-lg p-4 focus:outline-none resize-none placeholder-gray-400"
            placeholder="e.g. A spicy chicken sandwich combo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="w-full bg-white rounded-2xl px-5 flex items-center mb-10">
          <span className="text-2xl font-bold text-gray-900 mr-2">₹</span>
          <input
            type="number"
            className="flex-1 bg-transparent h-20 text-3xl font-extrabold text-gray-900 focus:outline-none placeholder-gray-400"
            placeholder="150"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-5 rounded-2xl text-xl font-extrabold text-white transition shadow-xl shadow-orange-500/30 flex justify-center items-center ${
            loading ? 'bg-orange-400 opacity-70 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 hover:-translate-y-1'
          }`}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
          ) : (
            'Cast Bid'
          )}
        </button>
      </div>
    </div>
  );
}
