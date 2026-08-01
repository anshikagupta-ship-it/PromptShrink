<<<<<<< HEAD
import { useState } from "react";
import {
  SlidersHorizontal,
  Zap,
  Brain,
  Rocket,
  CheckCircle2
} from "lucide-react";

export default function CompressionSettings() {

  const [mode,setMode]=useState("Balanced");
  const [ratio,setRatio]=useState(70);

  const [settings,setSettings]=useState({
    code:true,
    urls:true,
    numbers:true,
    entities:true
  });

  const toggle=(key)=>{
    setSettings({...settings,[key]:!settings[key]});
  }

  const modes=[
    {
      title:"Fast",
      icon:<Zap size={18}/>
    },
    {
      title:"Balanced",
      icon:<Brain size={18}/>
    },
    {
      title:"Maximum",
      icon:<Rocket size={18}/>
    }
  ];

  return(

<section className="max-w-7xl mx-auto px-6 py-12">

<div className="h-full rounded-3xl bg-[#111827]/80 backdrop-blur-xl border border-slate-800 p-8">

<div className="flex items-center gap-3 mb-8">

<SlidersHorizontal className="text-indigo-400"/>

<h2 className="text-3xl font-bold">

Compression Settings

</h2>

</div>

{/* Modes */}

<div className="grid md:grid-cols-3 gap-5">

{modes.map((item)=>(

<button
key={item.title}
onClick={()=>setMode(item.title)}
className={`rounded-2xl border p-5 transition duration-300 ${
mode===item.title
?"border-indigo-500 bg-indigo-500/20"
:"border-slate-700 hover:border-slate-500"
}`}
>

<div className="flex justify-center mb-3">

{item.icon}

</div>

<h3 className="font-semibold">

{item.title}

</h3>

</button>

))}

</div>

{/* Slider */}

<div className="mt-10">

<div className="flex justify-between mb-3">

<span>Compression Ratio</span>

<span>{ratio}%</span>

</div>

<input
type="range"
min="20"
max="90"
value={ratio}
onChange={(e)=>setRatio(e.target.value)}
className="w-full accent-indigo-500"
/>

</div>

{/* Toggles */}

<div className="grid md:grid-cols-2 gap-5 mt-10">

{[
["code","Preserve Code"],
["urls","Preserve URLs"],
["numbers","Preserve Numbers"],
["entities","Preserve Named Entities"]
].map(([key,label])=>(

<div
key={key}
onClick={()=>toggle(key)}
className="cursor-pointer rounded-2xl border border-slate-700 p-5 hover:border-indigo-500 transition flex justify-between items-center"
>

<span>{label}</span>

{settings[key] ? (
<CheckCircle2 className="text-green-400"/>
):(
<div className="w-5 h-5 rounded-full border border-slate-500"/>
)}

</div>

))}

</div>

{/* Summary */}

<div className="mt-10 rounded-2xl bg-[#0B1220] border border-slate-700 p-6">

<div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">

<div>

<p className="text-3xl font-bold text-indigo-400">
{ratio}%
</p>

<p className="text-slate-400 text-sm">
Compression
</p>

</div>

<div>

<p className="text-3xl font-bold text-green-400">
95%
</p>

<p className="text-slate-400 text-sm">
Accuracy
</p>

</div>

<div>

<p className="text-3xl font-bold text-cyan-400">
61%
</p>

<p className="text-slate-400 text-sm">
Latency ↓
</p>

</div>

<div>

<p className="text-3xl font-bold text-yellow-400">
60%
</p>

<p className="text-slate-400 text-sm">
Cost Saved
</p>

</div>

</div>

<button className="w-full mt-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-4 text-lg font-semibold hover:scale-[1.02] transition">

Compress Prompt

</button>

</div>

</div>

</section>

)

}
=======
import React from "react";

export default function CompressionSettings({
  model,
  setModel,
  mode,
  setMode,
  targetRatio,
  setTargetRatio,
}) {
  const models = [
    { id: "gpt-4o", name: "OpenAI GPT-4o", context: "128k" },
    { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", context: "200k" },
    { id: "llama-3-70b", name: "Meta Llama 3 70B", context: "8k" },
    { id: "gemini-1-5-pro", name: "Google Gemini 1.5 Pro", context: "1M" },
  ];

  const modes = [
    { id: "conservative", name: "Conservative", ratio: 50, desc: "Prioritize maximum accuracy retention" },
    { id: "balanced", name: "Balanced", ratio: 70, desc: "Recommended balance (70%+ target)" },
    { id: "aggressive", name: "Aggressive", ratio: 85, desc: "Maximum token & cost reduction" },
  ];

  return (
    <div className="bg-[#111927] border border-white/10 rounded-2xl p-6 shadow-xl">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Model & Engine Parameters
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Model Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Target LLM Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.context})
              </option>
            ))}
          </select>
        </div>

        {/* Compression Mode */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Compression Mode</label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#0B1220] p-1 rounded-xl border border-white/10">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  setTargetRatio(m.ratio);
                }}
                className={`py-1.5 px-2 text-xs rounded-lg font-medium transition-all ${
                  mode === m.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Target Token Ratio Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-400">Target Token Reduction</label>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
              {targetRatio}%
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="90"
            step="5"
            value={targetRatio}
            onChange={(e) => setTargetRatio(Number(e.target.value))}
            className="w-full h-2 bg-[#0B1220] rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
            <span>30%</span>
            <span>Target: &gt;70%</span>
            <span>90%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 71ec4bfcc37aff6296541fb91c14392aad28b18f
