import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <Navbar />
      <Hero />
    </div>
  );
}