import { createContext, useContext, useReducer, useRef, useEffect } from 'react';

const ThemeContext = createContext();

const themeReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_DARK':    return { ...state, isDark: !state.isDark };
    case 'SET_ACCENT':     return { ...state, accentColor: action.payload };
    case 'TOGGLE_COMPACT': return { ...state, isCompact: !state.isCompact };
    case 'RESET':          return initialState;
    default:               return state;
  }
};

const initialState = { isDark: false, accentColor: '#ff6b35', isCompact: false };

function applyTheme(theme) {
  const r = document.documentElement;
  r.style.setProperty('--orange', theme.accentColor);

  if (theme.isDark) {
    r.style.setProperty('--page-bg',           '#0d0d1a');
    r.style.setProperty('--card-bg',           '#1a1a2e');
    r.style.setProperty('--card-bg-2',         '#16213e');
    r.style.setProperty('--light-bg',          '#16213e');
    r.style.setProperty('--text-primary',      '#f0f0f0');
    r.style.setProperty('--text-secondary',    '#aaaaaa');
    r.style.setProperty('--dark',              '#f0f0f0');
    r.style.setProperty('--border-color',      'rgba(255,255,255,0.08)');
    r.style.setProperty('--card-shadow',       '0 4px 20px rgba(0,0,0,0.4)');
    r.style.setProperty('--input-bg',          '#16213e');
    r.style.setProperty('--input-border',      'rgba(255,255,255,0.15)');
    r.style.setProperty('--input-color',       '#f0f0f0');
    r.style.setProperty('--admin-bg',          '#0d0d1a');
    r.style.setProperty('--admin-card',        '#1a1a2e');
    r.style.setProperty('--admin-sidebar-bg',  '#050510');
    r.style.setProperty('--table-hover',       'rgba(255,255,255,0.04)');
    r.style.setProperty('--table-border',      'rgba(255,255,255,0.06)');
    r.style.setProperty('--modal-bg',          '#1a1a2e');
    r.style.setProperty('--navbar-bg',         '#0d0d1a');
    r.style.setProperty('--status-tab-bg',     '#1a1a2e');
    r.style.setProperty('--status-tab-border', 'rgba(255,255,255,0.12)');
    r.style.setProperty('--status-tab-color',  '#aaa');
    document.body.setAttribute('data-theme', 'dark');
  } else {
    r.style.setProperty('--page-bg',           '#f8f9fa');
    r.style.setProperty('--card-bg',           '#ffffff');
    r.style.setProperty('--card-bg-2',         '#f8f9fa');
    r.style.setProperty('--light-bg',          '#FFF8F5');
    r.style.setProperty('--text-primary',      '#333333');
    r.style.setProperty('--text-secondary',    '#888888');
    r.style.setProperty('--dark',              '#1a1a2e');
    r.style.setProperty('--border-color',      '#f0f0f0');
    r.style.setProperty('--card-shadow',       '0 4px 20px rgba(0,0,0,0.08)');
    r.style.setProperty('--input-bg',          '#ffffff');
    r.style.setProperty('--input-border',      '#e8e8e8');
    r.style.setProperty('--input-color',       '#333333');
    r.style.setProperty('--admin-bg',          '#f4f6f9');
    r.style.setProperty('--admin-card',        '#ffffff');
    r.style.setProperty('--admin-sidebar-bg',  '#1a1a2e');
    r.style.setProperty('--table-hover',       '#fafafa');
    r.style.setProperty('--table-border',      '#f5f5f5');
    r.style.setProperty('--modal-bg',          '#ffffff');
    r.style.setProperty('--navbar-bg',         '#ffffff');
    r.style.setProperty('--status-tab-bg',     '#ffffff');
    r.style.setProperty('--status-tab-border', '#e0e0e0');
    r.style.setProperty('--status-tab-color',  '#555');
    document.body.removeAttribute('data-theme');
  }

  if (theme.isCompact) {
    r.style.setProperty('--pad',    '16px');
    r.style.setProperty('--radius', '10px');
  } else {
    r.style.setProperty('--pad',    '32px');
    r.style.setProperty('--radius', '20px');
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, dispatch] = useReducer(themeReducer, initialState);
  const changeCountRef = useRef(0);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleDark    = () => { dispatch({ type: 'TOGGLE_DARK' });             changeCountRef.current++; };
  const setAccent     = (c) => { dispatch({ type: 'SET_ACCENT', payload: c }); changeCountRef.current++; };
  const toggleCompact = () => { dispatch({ type: 'TOGGLE_COMPACT' });          changeCountRef.current++; };
  const resetTheme    = () => { dispatch({ type: 'RESET' });                   changeCountRef.current = 0; };

  return (
    <ThemeContext.Provider value={{ theme, toggleDark, setAccent, toggleCompact, resetTheme, changeCountRef }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
