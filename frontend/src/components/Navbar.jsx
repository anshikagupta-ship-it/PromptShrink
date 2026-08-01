import { useState } from "react";
import { Menu, X } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

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

          <button className="w-11 h-11 rounded-xl border border-white/10 hover:bg-white/10 transition flex items-center justify-center">

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