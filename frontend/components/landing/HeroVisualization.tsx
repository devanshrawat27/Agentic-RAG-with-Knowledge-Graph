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

      {/* Tiny floating particles */}
      {[
        { x: 40, y: 100, s: 2.5, o: 0.12, d: 4 },
        { x: 420, y: 150, s: 2, o: 0.1, d: 4.5 },
        { x: 50, y: 350, s: 2, o: 0.08, d: 5 },
        { x: 400, y: 340, s: 2.5, o: 0.1, d: 3.8 },
        { x: 250, y: 35, s: 1.5, o: 0.09, d: 4.2 },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{ left: p.x, top: p.y, width: p.s, height: p.s }}
          animate={{ opacity: [p.o, p.o * 3, p.o] }}
          transition={{
            duration: p.d,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
        />
      ))}

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