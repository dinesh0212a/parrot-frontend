import { useReducer, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const panelReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE':   return { ...state, isOpen: !state.isOpen };
    case 'SET_TAB':  return { ...state, activeTab: action.payload };
    default:         return state;
  }
};

const ACCENT_COLORS = [
  { name: 'Parrot Orange', hex: '#ff6b35' },
  { name: 'Royal Blue',    hex: '#3498db' },
  { name: 'Deep Purple',   hex: '#9b59b6' },
  { name: 'Forest Green',  hex: '#27ae60' },
  { name: 'Cherry Red',    hex: '#e74c3c' },
  { name: 'Teal',          hex: '#1abc9c' },
];

export default function ThemePanel() {
  const { theme, toggleDark, setAccent, toggleCompact, resetTheme } = useTheme();
  const [panelState, dispatch] = useReducer(panelReducer, { isOpen: false, activeTab: 'colors' });
  const colorInputRef = useRef(null);

  const focusColorInput = () => {
    if (colorInputRef.current) {
      colorInputRef.current.focus();
      colorInputRef.current.click();
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => dispatch({ type: 'TOGGLE' })}
        style={{
          background: theme.accentColor, color: 'white', border: 'none',
          borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', gap: 8
        }}
      >
        🎨 Theme {panelState.isOpen ? '▲' : '▼'}
      </button>

      {panelState.isOpen && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 999,
          background: 'white', borderRadius: 20, padding: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: 320,
          border: '1px solid #f0f0f0'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>🎨 App Theme Settings</h3>

          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {['colors', 'layout'].map(tab => (
              <button key={tab} onClick={() => dispatch({ type: 'SET_TAB', payload: tab })}
                style={{
                  flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: 'Poppins', fontSize: 12, fontWeight: 700,
                  background: panelState.activeTab === tab ? theme.accentColor : '#f5f5f5',
                  color: panelState.activeTab === tab ? 'white' : '#555'
                }}>
                {tab === 'colors' ? '🎨 Colors' : '📐 Layout'}
              </button>
            ))}
          </div>

          {panelState.activeTab === 'colors' && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 10 }}>PRESET ACCENTS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {ACCENT_COLORS.map(c => (
                  <button key={c.hex}
                    onClick={() => setAccent(c.hex)}
                    style={{
                      background: c.hex,
                      border: theme.accentColor === c.hex ? '3px solid #333' : '3px solid transparent',
                      borderRadius: 10, padding: '10px 6px', cursor: 'pointer',
                      color: 'white', fontSize: 10, fontWeight: 700, fontFamily: 'Poppins'
                    }}>
                    {theme.accentColor === c.hex ? '✓ ' : ''}{c.name}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>CUSTOM COLOR</div>
                <input ref={colorInputRef} type="color" value={theme.accentColor}
                  onChange={e => setAccent(e.target.value)}
                  style={{ width: 40, height: 32, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                />
                <button onClick={focusColorInput}
                  style={{ fontSize: 11, background: '#f5f5f5', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontFamily: 'Poppins' }}>
                  Pick Color
                </button>
              </div>
            </div>
          )}

          {panelState.activeTab === 'layout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>🌙 Dark Mode</div>
                <div onClick={toggleDark} style={{
                  width: 46, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background .3s',
                  background: theme.isDark ? theme.accentColor : '#ddd', position: 'relative'
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: 'white',
                    position: 'absolute', top: 3, transition: 'left .3s',
                    left: theme.isDark ? 24 : 4
                  }} />
                </div>
              </label>

              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>📐 Compact Mode</div>
                <div onClick={toggleCompact} style={{
                  width: 46, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background .3s',
                  background: theme.isCompact ? theme.accentColor : '#ddd', position: 'relative'
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: 'white',
                    position: 'absolute', top: 3, transition: 'left .3s',
                    left: theme.isCompact ? 24 : 4
                  }} />
                </div>
              </label>
            </div>
          )}

          <button onClick={resetTheme}
            style={{ width: '100%', marginTop: 16, background: '#f5f5f5', border: 'none', borderRadius: 10, padding: 10, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600, fontSize: 12 }}>
            ↺ Reset Theme
          </button>
        </div>
      )}
    </div>
  );
}
