import React, { createContext, useContext, useState } from "react";

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [authModal, setAuthModal] = useState(false); // Sign-in modal state
  const [loggedIn, setLoggedIn] = useState(false);   // Auth state

  return (
    <AuthContext.Provider value={{ authModal, setAuthModal, loggedIn, setLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy usage
export const useAuth = () => useContext(AuthContext);
