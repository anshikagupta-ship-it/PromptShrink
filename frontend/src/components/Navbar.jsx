<<<<<<< HEAD
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

=======
>>>>>>> 71ec4bfcc37aff6296541fb91c14392aad28b18f
export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    "Features",
    "Playground",
    "Analytics",
    "About",
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full z-50 border-b border-white/10 backdrop-blur-xl bg-[#030712]/70"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Logo */}

        <div className="flex items-center gap-4">

          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-500/30">
            P
          </div>

          <div>

            <h1 className="text-xl font-bold tracking-tight">
              PromptShrink
            </h1>

            <p className="text-xs text-slate-400">
              AI Context Compression
            </p>

          </div>

        </div>

        {/* Desktop Navigation */}

        <nav className="hidden lg:flex items-center gap-10">

          {navLinks.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-slate-300 hover:text-white transition duration-300"
            >
              {item}
            </a>
          ))}

        </nav>

        {/* Right Buttons */}

        <div className="hidden lg:flex items-center gap-4">

<<<<<<< HEAD
          <button className="w-11 h-11 rounded-xl border border-white/10 hover:bg-white/10 transition flex items-center justify-center">
=======
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
>>>>>>> 71ec4bfcc37aff6296541fb91c14392aad28b18f

            <FaGithub size={18} />

          </button>

          <button className="bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition shadow-xl shadow-indigo-500/20">
            Launch Demo
          </button>

        </div>

        {/* Mobile */}

        <button
          className="lg:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>

      </div>

      {open && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:hidden border-t border-white/10 bg-[#030712]"
        >

          <div className="flex flex-col p-6 gap-5">

            {navLinks.map((item) => (

              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-slate-300"
              >
                {item}
              </a>

            ))}

            <button className="mt-4 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-xl py-3 font-semibold">
              Launch Demo
            </button>

          </div>

        </motion.div>

      )}

    </motion.header>
  );
}