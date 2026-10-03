"use client";

import { motion } from "framer-motion";
import { Container } from "./primitives";

export function FinalCTA() {
  return (
    <section className="relative px-6 py-20 md:py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[32px] border border-white/[0.1] bg-[#07080b] px-6 py-20 text-center md:px-12 md:py-28 shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)]"
        >
          {/* Luminous silk ribbon waves in background matching reference */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 1200 600"
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                {/* Silk wave left gradient */}
                <linearGradient id="silk-grad-left" x1="0%" y1="100%" x2="50%" y2="40%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                  <stop offset="40%" stopColor="#93c5fd" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#ffffff" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#07080b" stopOpacity="0" />
                </linearGradient>

                {/* Silk wave right gradient */}
                <linearGradient id="silk-grad-right" x1="100%" y1="100%" x2="55%" y2="50%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                  <stop offset="35%" stopColor="#c084fc" stopOpacity="0.2" />
                  <stop offset="70%" stopColor="#ffffff" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#07080b" stopOpacity="0" />
                </linearGradient>

                {/* Ambient glow filter */}
                <filter id="silk-blur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="30" />
                </filter>
                <filter id="soft-glow" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="12" />
                </filter>
              </defs>

              {/* Blurred under-glow ribbons */}
              <path
                d="M -100 600 Q 200 420 400 380 T 900 480 Q 1100 520 1300 600 Z"
                fill="url(#silk-grad-left)"
                filter="url(#silk-blur)"
                opacity="0.7"
              />
              <path
                d="M 1300 600 Q 1000 380 750 420 T 200 560 Q 50 580 -100 600 Z"
                fill="url(#silk-grad-right)"
                filter="url(#silk-blur)"
                opacity="0.6"
              />

              {/* Left silk crest ribbon */}
              <motion.path
                d="M -50 580 C 150 420, 280 340, 520 420 C 720 480, 850 520, 1050 440 C 1150 400, 1220 430, 1280 500"
                stroke="url(#silk-grad-left)"
                strokeWidth="45"
                strokeLinecap="round"
                fill="none"
                opacity="0.35"
                filter="url(#soft-glow)"
                animate={{
                  d: [
                    "M -50 580 C 150 420, 280 340, 520 420 C 720 480, 850 520, 1050 440 C 1150 400, 1220 430, 1280 500",
                    "M -50 560 C 180 400, 310 360, 540 400 C 740 440, 880 500, 1070 460 C 1160 430, 1220 450, 1280 520",
                    "M -50 580 C 150 420, 280 340, 520 420 C 720 480, 850 520, 1050 440 C 1150 400, 1220 430, 1280 500",
                  ],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Crisp top light line on the wave crest */}
              <motion.path
                d="M -50 570 C 160 410, 290 330, 530 410 C 730 470, 860 510, 1060 430 C 1150 390, 1210 420, 1270 490"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2.5"
                fill="none"
                filter="url(#soft-glow)"
                animate={{
                  d: [
                    "M -50 570 C 160 410, 290 330, 530 410 C 730 470, 860 510, 1060 430 C 1150 390, 1210 420, 1270 490",
                    "M -50 550 C 190 390, 320 350, 550 390 C 750 430, 890 490, 1080 450 C 1160 420, 1210 440, 1270 510",
                    "M -50 570 C 160 410, 290 330, 530 410 C 730 470, 860 510, 1060 430 C 1150 390, 1210 420, 1270 490",
                  ],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Right secondary silk wave */}
              <motion.path
                d="M 1250 580 C 1050 430, 880 390, 680 470 C 500 540, 360 520, 150 460 C 50 430, 0 470, -50 520"
                stroke="url(#silk-grad-right)"
                strokeWidth="35"
                strokeLinecap="round"
                fill="none"
                opacity="0.3"
                filter="url(#soft-glow)"
                animate={{
                  d: [
                    "M 1250 580 C 1050 430, 880 390, 680 470 C 500 540, 360 520, 150 460 C 50 430, 0 470, -50 520",
                    "M 1250 560 C 1030 410, 860 410, 660 450 C 480 500, 340 540, 130 480 C 40 450, 0 490, -50 540",
                    "M 1250 580 C 1050 430, 880 390, 680 470 C 500 540, 360 520, 150 460 C 50 430, 0 470, -50 520",
                  ],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Right wave crest highlight */}
              <motion.path
                d="M 1250 575 C 1050 425, 880 385, 680 465 C 500 535, 360 515, 150 455 C 50 425, 0 465, -50 515"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.8"
                fill="none"
                filter="url(#soft-glow)"
                animate={{
                  d: [
                    "M 1250 575 C 1050 425, 880 385, 680 465 C 500 535, 360 515, 150 455 C 50 425, 0 465, -50 515",
                    "M 1250 555 C 1030 405, 860 405, 660 445 C 480 495, 340 535, 130 475 C 40 445, 0 485, -50 535",
                    "M 1250 575 C 1050 425, 880 385, 680 465 C 500 535, 360 515, 150 455 C 50 425, 0 465, -50 515",
                  ],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>

            {/* Ambient center top glow */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[280px] w-[500px] rounded-full opacity-30"
              style={{
                background: "radial-gradient(circle, rgba(147,197,253,0.15), transparent 70%)",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Pill badge matching reference */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-1.5 text-[12.5px] font-medium text-white/80 backdrop-blur-xl"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#38bdf8]" />
              Start Building Your Knowledge
            </motion.div>

            {/* Main title */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-[54px] md:leading-[1.12]"
            >
              Turn Your Documents into Intelligence
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-4 max-w-xl text-[15px] text-white/55 sm:text-base"
            >
              Join researchers, teams, and organizations using TrueDocs to work
              smarter.
            </motion.p>

            {/* Action buttons matching reference */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
            >
              {/* Primary white pill button */}
              <a
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-neutral-900 transition-all duration-300 hover:bg-neutral-100 hover:shadow-[0_0_35px_-8px_rgba(255,255,255,0.6)] active:scale-95"
              >
                Get Started Free
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              {/* View GitHub button with GitHub icon */}
              <a
                href="https://github.com/devanshrawat27/Agentic-RAG-with-Knowledge-Graph"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-black/40 px-6 py-3 text-[14px] font-medium text-white/90 backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
              >
                View GitHub
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white/80 transition-transform duration-300 group-hover:scale-110">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.36-3.37-1.36-.46-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.07.64-1.32-2.22-.26-4.55-1.13-4.55-5.03 0-1.11.39-2.02 1.03-2.73-.1-.27-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.04.8-.23 1.65-.34 2.5-.34s1.7.11 2.5.34c1.91-1.32 2.75-1.04 2.75-1.04.55 1.41.2 2.44.1 2.71.64.71 1.03 1.62 1.03 2.73 0 3.91-2.34 4.77-4.57 5.02.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.03 10.03 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
                  />
                </svg>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}