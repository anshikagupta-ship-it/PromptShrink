import {
CheckCircle2,
Database,
Cpu,
Sparkles
} from "lucide-react";

const steps=[
{
icon:Database,
title:"Input Prompt",
desc:"Prompt uploaded"
},
{
icon:Cpu,
title:"Semantic Analysis",
desc:"Important tokens detected"
},
{
icon:Sparkles,
title:"Compression",
desc:"Redundant context removed"
},
{
icon:CheckCircle2,
title:"Output Ready",
desc:"Compressed prompt generated"
}
];

export default function ProcessingTimeline(){

return(

<section className="max-w-7xl mx-auto px-6 py-12">

<h2 className="text-3xl font-bold text-white mb-10">
Processing Pipeline
</h2>

<div className="grid md:grid-cols-4 gap-6">

{steps.map((step,index)=>{

const Icon=step.icon;

return(

<div
key={index}
className="bg-[#111827] border border-slate-800 rounded-3xl p-6 text-center hover:-translate-y-2 duration-300"
>

<div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mx-auto">

<Icon className="text-white"/>

</div>

<h3 className="text-xl font-semibold text-white mt-6">
{step.title}
</h3>

<p className="text-slate-400 mt-3">
{step.desc}
</p>

</div>

)

})}

</div>

</section>

)

}