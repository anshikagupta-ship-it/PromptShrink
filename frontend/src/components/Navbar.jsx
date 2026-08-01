import { Github } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-xl bg-[#0B1220]/80">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold">
            P
          </div>

          <div>
            <h1 className="font-bold text-lg">PromptShrink</h1>
            <p className="text-xs text-gray-400">
              LLM Context Compression
            </p>
          </div>
        </div>

        <nav className="hidden md:flex gap-8 text-sm text-gray-300">
          <a href="#" className="hover:text-white transition">
            Features
          </a>

          <a href="#" className="hover:text-white transition">
            Playground
          </a>

          <a href="#" className="hover:text-white transition">
            Analytics
          </a>
        </nav>

        <div className="flex items-center gap-3">

          <button className="border border-white/10 px-4 py-2 rounded-xl hover:bg-white/5 transition flex items-center gap-2">

            <Github size={18} />

            GitHub

          </button>

          <button className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl font-medium transition">
            Try Demo
          </button>

        </div>
      </div>
    </header>
  );
}