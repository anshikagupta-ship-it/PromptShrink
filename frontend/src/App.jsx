import Home from "./pages/Home";

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* Background Glow */}

      <div className="fixed inset-0 -z-10">

        <div className="absolute top-[-180px] left-[-120px] h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-[120px]" />

        <div className="absolute top-40 right-[-150px] h-[350px] w-[350px] rounded-full bg-cyan-500/20 blur-[120px]" />

        <div className="absolute bottom-[-180px] left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[140px]" />

      </div>

      <Home />

    </div>
  );
}