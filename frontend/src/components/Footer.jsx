import { Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="flex flex-col md:flex-row justify-between items-center gap-8">

          <div>
            <h2 className="text-3xl font-black">PromptShrink</h2>
            <p className="text-slate-400 mt-3 max-w-md">
              AI-powered context compression for Large Language Models.
            </p>
          </div>

          <div className="flex gap-4">

            <button className="w-12 h-12 rounded-xl bg-white/5 hover:bg-indigo-600 transition flex items-center justify-center">
              <FaGithub />
            </button>

            <button className="w-12 h-12 rounded-xl bg-white/5 hover:bg-indigo-600 transition flex items-center justify-center">
              <FaLinkedin />
            </button>

            <button className="w-12 h-12 rounded-xl bg-white/5 hover:bg-indigo-600 transition flex items-center justify-center">
              <Mail size={20} />
            </button>

          </div>

        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-slate-500">
          © 2026 PromptShrink 
        </div>

      </div>
    </footer>
  );
}