import React, { useState } from "react";

export default function LandingDeveloperSection() {
  const [lang, setLang] = useState("python");

  const codeSnippets = {
    python: `from contextzero import ContextZero
from openai import OpenAI

# 1. Initialize ContextZero Engine
cz = ContextZero(api_key="cz_live_89412")
client = OpenAI()

# 2. Optimize prompt context before sending to LLM
raw_context = open("server_logs.txt").read()
optimized = cz.compress(
    prompt=raw_context,
    target_ratio=70  # Reduce tokens by ~70%
)

print(f"Tokens reduced from {optimized.original_tokens} -> {optimized.compressed_tokens}")

# 3. Call target LLM with 70% fewer tokens
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": optimized.text}]
)`,
    typescript: `import { ContextZero } from "@contextzero/sdk";
import OpenAI from "openai";

const cz = new ContextZero({ apiKey: process.env.CZ_API_KEY });
const openai = new OpenAI();

async function run() {
  // 1. Compress raw prompt context
  const optimized = await cz.compress({
    prompt: rawLogContext,
    targetRatio: 70
  });

  console.log(\`Saved \${optimized.tokensSaved} tokens (\${optimized.reductionRatio}% reduction)\`);

  // 2. Forward optimized context to OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: optimized.text }]
  });
}`,
  };

  return (
    <section id="developers" className="py-16 px-6 max-w-5xl mx-auto font-sans">
      <div className="bg-[#121212] border border-white/[0.08] rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <span className="text-xs font-mono text-[#a3a3a3] uppercase tracking-wider">Developer SDK</span>
            <h3 className="text-lg font-bold text-[#f5f5f5]">Drop-in 3-Line Integration</h3>
          </div>

          <div className="flex items-center p-1 bg-[#1a1a1a] rounded-lg border border-white/[0.08] text-xs font-mono">
            <button
              onClick={() => setLang("python")}
              className={`px-3 py-1 rounded-md transition ${
                lang === "python" ? "bg-[#262626] text-[#f5f5f5]" : "text-[#737373] hover:text-[#a3a3a3]"
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setLang("typescript")}
              className={`px-3 py-1 rounded-md transition ${
                lang === "typescript" ? "bg-[#262626] text-[#f5f5f5]" : "text-[#737373] hover:text-[#a3a3a3]"
              }`}
            >
              TypeScript
            </button>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4 overflow-x-auto font-mono text-xs text-[#f5f5f5] leading-relaxed">
          <pre>{codeSnippets[lang]}</pre>
        </div>
      </div>
    </section>
  );
}
