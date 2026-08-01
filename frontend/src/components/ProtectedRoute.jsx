import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen bg-[#0a0a0a] text-[#f5f5f5] flex flex-col items-center justify-center font-sans space-y-3">
        <div className="w-8 h-8 rounded-xl bg-[#262626] border border-white/10 flex items-center justify-center font-bold text-white text-xs animate-pulse">
          CZ
        </div>
        <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
