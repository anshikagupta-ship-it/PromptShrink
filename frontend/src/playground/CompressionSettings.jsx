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