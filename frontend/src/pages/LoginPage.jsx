import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginPage() {
  const { loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleBtnRef = useRef(null);
  const [authError, setAuthError] = useState("");

  const from = location.state?.from?.pathname || "/app";

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const handleCredentialResponse = async (response) => {
      try {
        setAuthError("");
        await loginWithGoogle(response.credential);
        navigate(from, { replace: true });
      } catch (err) {
        setAuthError(err.message || "Failed to authenticate with Google");
      }
    };

    if (window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_black",
          size: "large",
          width: 280,
          shape: "pill",
          logo_alignment: "left",
        });
      } catch (err) {
        console.error("GIS render error:", err);
      }
    } else {
      // Retry if GIS script is still loading
      const interval = setInterval(() => {
        if (window.google?.accounts?.id && googleBtnRef.current) {
          clearInterval(interval);
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
          });

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "filled_black",
            size: "large",
            width: 280,
            shape: "pill",
            logo_alignment: "left",
          });
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [loginWithGoogle, navigate, from]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#121212] border border-white/[0.07] rounded-2xl p-8 shadow-2xl text-center space-y-6 animate-fade-in">
        {/* App Brand Logo */}
        <div className="w-12 h-12 rounded-2xl bg-[#262626] border border-white/10 flex items-center justify-center font-bold text-white text-base mx-auto shadow-xs">
          CZ
        </div>

        {/* Header Text */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-[#f5f5f5] tracking-tight">
            Welcome to ContextZero
          </h1>
          <p className="text-xs text-[#a3a3a3]">
            Sign in to continue to your context compression account
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium">
            {authError}
          </div>
        )}

        {/* Google Identity Services Button Container */}
        <div className="py-2 flex flex-col items-center justify-center">
          <div ref={googleBtnRef} className="min-h-[44px]"></div>
        </div>

        {/* Subdued Terms Footnote */}
        <p className="text-[11px] text-[#737373] leading-relaxed">
          By continuing, you agree to ContextZero's Terms of Service and Privacy Policy. Minimum identity scope requested: <code className="font-mono text-[10px]">openid, email, profile</code>.
        </p>
      </div>
    </div>
  );
}
