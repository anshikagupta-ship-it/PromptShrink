import React from "react";
import LandingNavbar from "../components/LandingNavbar";
import LandingHero from "../components/LandingHero";
import LandingLiveCompressor from "../components/LandingLiveCompressor";
import LandingWhatItDoes from "../components/LandingWhatItDoes";
import LandingHowItWorks from "../components/LandingHowItWorks";
import LandingRealResults from "../components/LandingRealResults";
import LandingWhatIsRemoved from "../components/LandingWhatIsRemoved";
import LandingWhyTokensMatter from "../components/LandingWhyTokensMatter";
import LandingFooter from "../components/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] selection:bg-white selection:text-black">
      {/* 1. Navbar */}
      <LandingNavbar />

      <main>
        {/* 2. Hero Section */}
        <LandingHero />

        {/* 3. Live Prompt Compressor (Main Attraction) */}
        <LandingLiveCompressor />

        {/* 4. What ContextZero Does */}
        <LandingWhatItDoes />

        {/* 5. How It Works */}
        <LandingHowItWorks />

        {/* 6. Real Before vs After Results */}
        <LandingRealResults />

        {/* 7. What Was Removed vs Preserved */}
        <LandingWhatIsRemoved />

        {/* 8. Why Token Reduction Matters */}
        <LandingWhyTokensMatter />

        {/* 9. Final CTA */}
        <section className="py-20 px-6 text-center max-w-3xl mx-auto space-y-6 font-sans">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#f5f5f5] tracking-tight">
            How much of your prompt do you actually need?
          </h2>
          <p className="text-sm text-[#a3a3a3] max-w-md mx-auto">
            Run it through ContextZero and find out.
          </p>
          <div>
            <a
              href="#compressor"
              className="inline-flex items-center justify-center gap-1.5 px-7 py-3 rounded-xl bg-[#f5f5f5] text-black hover:bg-white font-medium text-sm transition shadow-md active:scale-95"
            >
              <span>Try ContextZero</span>
              <span>→</span>
            </a>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <LandingFooter />
    </div>
  );
}
