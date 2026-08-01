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

            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>

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