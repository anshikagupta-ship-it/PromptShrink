import Navbar from "../components/layout/Navbar";
import Hero from "../components/hero/Hero";

function Home() {
  return (
    <div className="bg-[#0B1220] min-h-screen text-white">
      <Navbar />
      <Hero />
    </div>
  );
}

export default Home;