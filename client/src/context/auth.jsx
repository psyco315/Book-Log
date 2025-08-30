import React, { createContext, useContext, useState } from "react";

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [authModal, setAuthModal] = useState(false); // Sign-in modal state
  const [loggedIn, setLoggedIn] = useState(false);   // Auth state
  const [currUser, setCurrUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);

  return (
    <AuthContext.Provider value={{ authModal, setAuthModal, loggedIn, setLoggedIn, currUser, setCurrUser, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy usage
export const useAuth = () => useContext(AuthContext);
