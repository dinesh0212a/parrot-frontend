import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('parrot_token'));

  useEffect(() => {
    const stored = localStorage.getItem('parrot_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userData, tok) => {
    setUser(userData);
    setToken(tok);
    localStorage.setItem('parrot_token', tok);
    localStorage.setItem('parrot_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('parrot_token');
    localStorage.removeItem('parrot_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
