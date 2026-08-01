import { UploadCloud, FileText, FileCode, File } from "lucide-react";
import { useState } from "react";

export default function UploadSection() {

  const [dragging,setDragging]=useState(false);

  return(

<section className="max-w-7xl mx-auto px-6 py-0">

<div
onDragOver={(e)=>{
e.preventDefault();
setDragging(true);
}}

onDragLeave={()=>setDragging(false)}

onDrop={(e)=>{
e.preventDefault();
setDragging(false);
}}

className={`rounded-3xl border-2 border-dashed transition duration-300 p-12 text-center ${
dragging
?"border-indigo-500 bg-indigo-500/10"
:"border-slate-700 bg-[#111827]"
}`}
>

<div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center mx-auto">

<UploadCloud size={38}/>

</div>

<h2 className="text-3xl font-bold mt-8">

Upload Prompt Files

</h2>

<p className="text-slate-400 mt-3">

Drag & Drop your prompt files here

</p>

<p className="text-slate-500 mt-2">

Supports TXT • PDF • DOCX

</p>

<button className="mt-8 bg-gradient-to-r from-indigo-600 to-cyan-500 px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition">

Browse Files

</button>

<div className="grid md:grid-cols-3 gap-6 mt-12">

<div className="rounded-2xl bg-[#0B1220] border border-slate-700 p-6">

<FileText className="mx-auto text-cyan-400"/>

<h3 className="mt-4 font-semibold">

TXT Files

</h3>

<p className="text-slate-400 text-sm mt-2">

Plain text prompts

</p>

</div>

<div className="rounded-2xl bg-[#0B1220] border border-slate-700 p-6">

<FileCode className="mx-auto text-green-400"/>

<h3 className="mt-4 font-semibold">

DOCX

</h3>

<p className="text-slate-400 text-sm mt-2">

Word Documents

</p>

</div>

<div className="rounded-2xl bg-[#0B1220] border border-slate-700 p-6">

<File className="mx-auto text-red-400"/>

<h3 className="mt-4 font-semibold">

PDF

</h3>

<p className="text-slate-400 text-sm mt-2">

Portable Documents

</p>

</div>

</div>

</div>

</section>

)

}