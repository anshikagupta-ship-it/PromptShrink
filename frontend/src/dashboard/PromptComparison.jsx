import { ArrowRight, Copy, CheckCircle2 } from "lucide-react";

const originalPrompt = `Summarize the following research paper in detail.
Include all important findings, methodology,
limitations, future work and applications.
Maintain technical terminology and provide
a concise conclusion.`;

const compressedPrompt = `Summarize research paper with
methodology, findings, limitations,
future work, applications and
technical conclusion.`;

export default function PromptComparison() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">

      <div className="text-center mb-14">

        <p className="uppercase tracking-[0.3em] text-indigo-400 text-sm font-semibold">
          Before vs After
        </p>

        <h2 className="text-5xl font-black mt-3">
          Prompt Comparison
        </h2>

        <p className="text-slate-400 mt-4">
          See how PromptShrink reduces unnecessary tokens while preserving meaning.
        </p>

      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Original */}

        <div className="rounded-3xl border border-red-500/20 bg-[#111827]/80 backdrop-blur-xl overflow-hidden">

          <div className="flex justify-between items-center border-b border-white/10 px-6 py-4">

            <div>

              <p className="text-red-400 font-semibold">
                Original Prompt
              </p>

              <p className="text-slate-400 text-sm">
                84 Tokens
              </p>

            </div>

            <Copy size={18} />

          </div>

          <div className="p-6">

            <pre className="whitespace-pre-wrap text-slate-300 leading-8 font-mono text-sm">
              {originalPrompt}
            </pre>

          </div>

        </div>

        {/* Compressed */}

        <div className="rounded-3xl border border-green-500/20 bg-[#111827]/80 backdrop-blur-xl overflow-hidden">

          <div className="flex justify-between items-center border-b border-white/10 px-6 py-4">

            <div>

              <p className="text-green-400 font-semibold">
                Compressed Prompt
              </p>

              <p className="text-slate-400 text-sm">
                24 Tokens
              </p>

            </div>

            <CheckCircle2 className="text-green-400" />

          </div>

          <div className="p-6">

            <pre className="whitespace-pre-wrap text-slate-300 leading-8 font-mono text-sm">
              {compressedPrompt}
            </pre>

          </div>

        </div>

      </div>

      {/* Result */}

      <div className="mt-12 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 p-8">

        <div className="grid md:grid-cols-3 gap-8 text-center">

          <div>

            <h3 className="text-5xl font-black text-indigo-400">
              71%
            </h3>

            <p className="text-slate-400 mt-2">
              Tokens Reduced
            </p>

          </div>

          <div className="flex justify-center items-center">

            <ArrowRight
              size={42}
              className="text-cyan-400"
            />

          </div>

          <div>

            <h3 className="text-5xl font-black text-green-400">
              95%
            </h3>

            <p className="text-slate-400 mt-2">
              Semantic Accuracy
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}