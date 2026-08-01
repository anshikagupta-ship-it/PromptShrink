import React from "react";
import { Link } from "react-router-dom";

export default function LandingNavbar() {
  return (
    <nav className="h-[64px] border-b border-white/[0.07] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between font-sans">
      {/* Left: Logo */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-7 h-7 rounded-lg bg-[#262626] border border-white/10 flex items-center justify-center font-bold text-white text-xs shadow-xs group-hover:border-white/20 transition">
          CZ
        </div>
        <span className="font-semibold text-base text-[#f5f5f5] tracking-tight">
          ContextZero
        </span>
      </Link>

      {/* Center & Right Nav Links */}
      <div className="flex items-center gap-6 text-xs text-[#a3a3a3] font-medium">
        <a href="#compressor" className="hover:text-[#f5f5f5] transition hidden sm:inline">Product</a>
        <a href="#how-it-works" className="hover:text-[#f5f5f5] transition hidden sm:inline">How It Works</a>
        <a href="#results" className="hover:text-[#f5f5f5] transition hidden sm:inline">Results</a>
        <Link
          to="/login"
          className="text-xs font-medium bg-[#f5f5f5] text-black hover:bg-white px-3.5 py-1.5 rounded-lg shadow-xs transition active:scale-95 ml-2"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}
