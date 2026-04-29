import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function RoutineChecker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const seenRoutines = useRef({}); // prevent duplicate triggers
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'user') return;

    const checkRoutines = async () => {
      try {
        const { data } = await api.get('/routines');
        if (!data || !data.length) return;

        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        const strTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;

        for (const routine of data) {
          if (routine.isActive && routine.triggerTime === strTime && !seenRoutines.current[routine._id + strTime]) {
            seenRoutines.current[routine._id + strTime] = true; // Mark as triggered for this specific minute
            
            // Show custom toast with action
            toast.info(
              <div>
                <h4>🔮 Zero-Click Routine Time!</h4>
                <p>Time for your usual from <b>{routine.restaurant.name}</b>?</p>
                <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                  <button 
                    onClick={() => handleExecuteRoutine(routine)}
                    style={{ background: '#00cc66', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Yes, Dispatch Now
                  </button>
                </div>
              </div>,
              { autoClose: false, position: 'top-center', closeOnClick: false }
            );
          }
        }
      } catch (err) {
        console.error('Failed to check routines', err);
      }
    };

    const handleExecuteRoutine = async (routine) => {
      toast.dismiss();
      try {
        const subtotal = routine.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        const orderData = {
          restaurantId: routine.restaurant._id,
          restaurantName: routine.restaurant.name,
          items: routine.items,
          subtotal: subtotal,
          totalAmount: subtotal + 40, // standard delivery fee
          deliveryAddress: 'Default Profile Address' // Could read from user profile
        };
        const { data } = await api.post('/orders', orderData);
        toast.success('Routine Dispatched!');
        navigate(`/track/${data._id}`);
      } catch (err) {
        toast.error('Failed to dispatch routine order');
      }
    };

    checkRoutines();
    // Poll every 60 seconds
    timerRef.current = setInterval(checkRoutines, 60000);

    return () => clearInterval(timerRef.current);
  }, [user, navigate]);

  return null;
}
