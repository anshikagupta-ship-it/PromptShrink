import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function AuthProvider({ children }) {
  // Initialize user instantly from localStorage cache for zero-delay refresh persistence
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("cz_user_profile");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshUser = async () => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          try {
            localStorage.setItem("cz_user_profile", JSON.stringify(data.user));
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Auth check warning:", err);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginWithGoogle = async (credential) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Google authentication failed");
      }

      setUser(data.user);
      try {
        localStorage.setItem("cz_user_profile", JSON.stringify(data.user));
      } catch {}
      setIsLoading(false);
      return data.user;
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      try {
        localStorage.removeItem("cz_user_profile");
      } catch {}
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
