import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

function Grain() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full opacity-[0.04] mix-blend-overlay"
    >
      <filter id="grain-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 1
                  0 0 0 0 1
                  0 0 0 0 1
                  0 0 0 1 0"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-noise)" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#050505] text-white antialiased">
      <Grain />
      <Navbar />
      <Hero />
      <ProductShowcase />
      <Features />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </main>
  );
}