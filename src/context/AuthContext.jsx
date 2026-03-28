import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Main role persists across reloads via localStorage
  const [userRole, setUserRole] = useState(localStorage.getItem('authRole'));
  
  // Section unlocks are IN-MEMORY only (reset on reload)
  const [unlockedSections, setUnlockedSections] = useState([]);

  const login = (role) => {
    localStorage.setItem('authRole', role);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem('authRole');
    setUserRole(null);
    setUnlockedSections([]); // Clear all locks
  };

  const unlockSection = (section) => {
    if (!unlockedSections.includes(section)) {
      setUnlockedSections(prev => [...prev, section]);
    }
  };

  const isSectionUnlocked = (section) => {
    return unlockedSections.includes(section) || userRole === 'superadmin';
  };

  return (
    <AuthContext.Provider value={{ userRole, login, logout, unlockSection, isSectionUnlocked }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
