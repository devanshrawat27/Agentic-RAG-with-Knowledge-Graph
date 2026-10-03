"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

/* ═══════════════════════════════════════════════════════════════════════════
   HERO VISUALIZATION
   The robot PNG has a white/light background. A CSS radial mask-image fades
   the edges to transparent so no rectangular frame is visible — the robot
   blends naturally into the dark hero. Ambient glow, floating animation,
   and a single "Analyzing" pill complete the look.
   ═══════════════════════════════════════════════════════════════════════════ */

interface Particle {
  x: number;
  y: number;
  s: number;
  o: number;
  peak: number;
  d: number;
  delay: number;
  dx: number;
  dy: number;
  color: string;
  glow?: boolean;
  blur?: number;
}

// Deterministic layout (no Math.random) so SSR and client markup match.
const PARTICLES: Particle[] = [
  // Far layer — blurred, large, very dim (depth)
  { x: 70, y: 120, s: 5, o: 0.05, peak: 2.2, d: 7.5, delay: 0.4, dx: 14, dy: -18, color: "rgba(180,200,230,0.7)", blur: 2.5 },
  { x: 410, y: 300, s: 6, o: 0.04, peak: 2, d: 8.5, delay: 1.6, dx: -16, dy: 12, color: "rgba(160,190,220,0.7)", blur: 3 },
  { x: 330, y: 90, s: 4, o: 0.06, peak: 2.4, d: 7, delay: 2.4, dx: -10, dy: 20, color: "rgba(190,210,240,0.7)", blur: 2 },

  // Mid layer — crisp small dust
  { x: 110, y: 300, s: 2, o: 0.16, peak: 2.6, d: 5.5, delay: 0.8, dx: 8, dy: -12, color: "rgba(255,255,255,0.9)" },
  { x: 360, y: 350, s: 2.2, o: 0.14, peak: 2.2, d: 6, delay: 2.1, dx: -9, dy: -10, color: "rgba(255,255,255,0.85)" },
  { x: 300, y: 60, s: 1.8, o: 0.13, peak: 2.8, d: 5, delay: 1.1, dx: 7, dy: 14, color: "rgba(255,255,255,0.8)" },
  { x: 60, y: 210, s: 2.3, o: 0.12, peak: 2.3, d: 6.5, delay: 3.0, dx: 12, dy: 6, color: "rgba(255,255,255,0.85)" },
  { x: 430, y: 190, s: 2, o: 0.15, peak: 2.5, d: 5.8, delay: 0.2, dx: -11, dy: -8, color: "rgba(255,255,255,0.9)" },
  { x: 190, y: 55, s: 1.6, o: 0.11, peak: 2.6, d: 6.2, delay: 1.8, dx: 9, dy: 11, color: "rgba(255,255,255,0.8)" },

  // Accent layer — cyan-tinted, gentle glow (ties to orbital rings)
  { x: 140, y: 400, s: 2.4, o: 0.18, peak: 2.4, d: 5.2, delay: 0.6, dx: 10, dy: -14, color: "rgba(125,211,252,0.95)", glow: true },
  { x: 380, y: 130, s: 2, o: 0.16, peak: 2.6, d: 5.6, delay: 2.7, dx: -8, dy: 16, color: "rgba(125,211,252,0.9)", glow: true },
  { x: 250, y: 415, s: 1.8, o: 0.14, peak: 2.8, d: 4.8, delay: 1.4, dx: 6, dy: -10, color: "rgba(148,190,255,0.9)", glow: true },
  { x: 45, y: 60, s: 2, o: 0.13, peak: 2.4, d: 6.8, delay: 3.3, dx: 13, dy: 9, color: "rgba(125,211,252,0.85)", glow: true },
];

export function HeroVisualization() {
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: 480, height: 440 }}
      aria-label="TrueDocs AI Agent"
    >
      {/* Soft ambient glow behind the robot */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 280,
          height: 280,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(200,200,210,0.06) 0%, rgba(200,200,210,0.02) 40%, transparent 70%)",
          borderRadius: "50%",
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut" as const,
        }}
      />

      {/* Subtle orbital ring — SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 480 440"
        fill="none"
        aria-hidden
      >
        <motion.ellipse
          cx="240"
          cy="220"
          rx="210"
          ry="150"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="0.7"
          strokeDasharray="6 8"
          transform="rotate(-10 240 220)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, delay: 0.6, ease: "easeOut" as const }}
        />
        <motion.ellipse
          cx="238"
          cy="218"
          rx="175"
          ry="185"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="0.5"
          strokeDasharray="4 10"
          transform="rotate(22 238 218)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.8, delay: 0.9, ease: "easeOut" as const }}
        />
      </svg>

      {/* ── Ambient particle field ───────────────────────────────────────
          A cohesive dust field orbiting the robot: layered depth (blurred
          far, sharp near), slow drift + twinkle, and subtle cyan/white tones
          that echo the orbital rings so it reads as one scene, not a sticker. */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 62% at 50% 50%, transparent 32%, black 62%, transparent 88%)",
          maskImage:
            "radial-gradient(ellipse 65% 62% at 50% 50%, transparent 32%, black 62%, transparent 88%)",
        }}
      >
        {PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: p.x,
              top: p.y,
              width: p.s,
              height: p.s,
              background: p.color,
              boxShadow: p.glow ? `0 0 ${p.s * 3}px ${p.color}` : "none",
              filter: p.blur ? `blur(${p.blur}px)` : "none",
            }}
            animate={{
              x: [0, p.dx, 0],
              y: [0, p.dy, 0],
              opacity: [p.o, p.o * p.peak, p.o],
            }}
            transition={{
              duration: p.d,
              repeat: Infinity,
              ease: "easeInOut" as const,
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* The robot image — masked with radial gradient to remove edges */}
      <motion.div
        className="relative z-10"
        style={{ width: 420, height: 380 }}
        initial={{ opacity: 0, y: 20, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="w-full h-full relative"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
        >
          <div
            className="relative w-full h-full"
            style={{
              WebkitMaskImage:
                "radial-gradient(ellipse 75% 70% at 48% 48%, black 45%, transparent 90%)",
              maskImage:
                "radial-gradient(ellipse 75% 70% at 48% 48%, black 45%, transparent 90%)",
            }}
          >
            <Image
              src="/Glossy AI Robot Analyzing UI.png"
              alt="TrueDocs AI Agent"
              fill
              className="object-contain"
              style={{
                filter:
                  "drop-shadow(0 0 30px rgba(255,255,255,0.04))",
              }}
              priority
            />
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
}