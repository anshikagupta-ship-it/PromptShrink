import React from "react";
import { Link } from "react-router-dom";

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#0a0a0a] py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#262626] border border-white/10 flex items-center justify-center font-bold text-white text-xs">
            CZ
          </div>
          <span className="font-semibold text-sm text-[#f5f5f5] tracking-tight">
            ContextZero
          </span>
        </div>

        {/* Center: Links */}
        <div className="flex items-center gap-6 text-xs text-[#a3a3a3]">
          <a href="#compressor" className="hover:text-[#f5f5f5] transition">Product</a>
          <a href="#how-it-works" className="hover:text-[#f5f5f5] transition">How It Works</a>
          <Link to="/login" className="hover:text-[#f5f5f5] transition">Sign In</Link>
        </div>

        {/* Right: Copyright */}
        <div className="text-xs text-[#737373]">
          © 2026 ContextZero
        </div>
      </div>
    </footer>
  );
}
