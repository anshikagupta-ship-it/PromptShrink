import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

import PromptInput from "../playground/PromptInput";
import UploadSection from "../playground/UploadSection";
import CompressionSettings from "../playground/CompressionSettings";
import AnalyticsDashboard from "../dashboard/AnalyticsDashboard";
import PromptComparison from "../dashboard/PromptComparison";
import Features from "../components/Features";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>

      <Navbar />

      <Hero />

      {/* Workspace */}

      <section className="max-w-7xl mx-auto px-6 py-20">

        <div className="mb-12">

          <h2 className="text-4xl font-black text-center">
            AI Workspace
          </h2>

          <p className="text-slate-400 text-center mt-3">
            Write, upload and optimize prompts from one place.
          </p>

        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8">

            <PromptInput />

          </div>

          <div className="lg:col-span-4">

            <CompressionSettings />

          </div>

        </div>

        <div className="mt-8">

          <UploadSection />

        </div>

      </section>
      <AnalyticsDashboard />
      <PromptComparison />
      <Features />
      <Footer />

    </>
  );
}