"use client";

import { Container } from "./primitives";
import { motion } from "framer-motion";

function OpenAILogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M22.28 9.37a5.63 5.63 0 0 0-.48-4.63 5.7 5.7 0 0 0-4.04-2.83 5.64 5.64 0 0 0-5.83 1.95 5.67 5.67 0 0 0-4.13.9 5.67 5.67 0 0 0-2.34 3.73 5.63 5.63 0 0 0-2.3 3.69 5.7 5.7 0 0 0 .7 4.79 5.63 5.63 0 0 0 .48 4.63 5.7 5.7 0 0 0 4.04 2.83 5.64 5.64 0 0 0 5.83-1.95 5.67 5.67 0 0 0 4.13-.9 5.67 5.67 0 0 0 2.34-3.73 5.63 5.63 0 0 0 2.3-3.69 5.7 5.7 0 0 0-.7-4.79Zm-8.48 11.23a4.23 4.23 0 0 1-2.73-1l.14-.08 4.54-2.62a.74.74 0 0 0 .37-.64V10.9l1.92 1.11a.07.07 0 0 1 .04.05v5.3a4.27 4.27 0 0 1-4.28 4.24Zm-9.2-3.94a4.25 4.25 0 0 1-.5-2.87c.03.02.09.05.14.08l4.54 2.62a.73.73 0 0 0 .74 0l5.55-3.2v2.21a.07.07 0 0 1-.03.06l-4.59 2.65a4.27 4.27 0 0 1-5.85-1.55ZM2.96 8.5a4.25 4.25 0 0 1 2.23-1.87v5.4a.74.74 0 0 0 .37.64l5.54 3.2-1.92 1.11a.07.07 0 0 1-.06 0L4.53 14.33A4.27 4.27 0 0 1 2.96 8.5Zm15.78 3.66-5.54-3.2 1.92-1.11a.07.07 0 0 1 .06 0l4.59 2.65a4.27 4.27 0 0 1-.65 7.71v-5.41a.74.74 0 0 0-.38-.64Zm1.91-2.88a6.34 6.34 0 0 0-.14-.08l-4.54-2.62a.73.73 0 0 0-.74 0L9.68 9.76V7.55a.07.07 0 0 1 .03-.06l4.59-2.65a4.27 4.27 0 0 1 6.35 4.42ZM8.63 12.45l-1.92-1.11a.07.07 0 0 1-.04-.05V5.99a4.27 4.27 0 0 1 7.01-3.28l-.14.08-4.54 2.62a.74.74 0 0 0-.37.64v6.4Zm1.05-2.24 2.47-1.42 2.47 1.42v2.85l-2.47 1.42-2.47-1.42v-2.85Z" />
      </svg>
      <span className="text-[17px] font-semibold tracking-tight text-white/90">OpenAI</span>
    </div>
  );
}

function AnthropicLogo() {
  return (
    <span className="text-[15px] font-medium tracking-[0.25em] text-white/90 font-sans">
      ANTHROP\C
    </span>
  );
}

function MetaLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M16.92 5.05c-1.39 0-2.67.58-3.6 1.54-.7-.71-1.63-1.17-2.68-1.4-.24-.05-.48-.09-.73-.09-2.62 0-4.8 1.94-5.32 4.54C4.05 12.3 5.8 14.86 8.36 15.2c1.03.14 2.05-.12 2.91-.71.55.57 1.25.99 2.05 1.22.51.15 1.05.23 1.6.23 2.87 0 5.3-2.18 5.6-5.07.33-3.15-2.02-5.82-5.1-5.82h1.5Zm-9.1 7.82c-1.46-.2-2.46-1.66-2.24-3.11.23-1.48 1.47-2.58 2.96-2.58.14 0 .28.02.41.05.97.22 1.73 1 1.92 1.97.23 1.24-.46 2.45-1.66 2.83-.45.15-.93.17-1.39.05v-.21h.01Zm8.32.74c-.31 0-.62-.05-.91-.14-.72-.21-1.33-.69-1.7-1.34-.37-.65-.43-1.41-.17-2.11.33-.89 1.1-1.53 2.04-1.69.24-.04.48-.06.73-.06 1.76 0 3.09 1.53 2.9 3.28-.17 1.63-1.52 2.88-3.15 2.88l.26-.82Z" />
      </svg>
      <span className="text-[17px] font-semibold text-white/90">Meta</span>
    </div>
  );
}

function GoogleLogo() {
  return (
    <span className="text-[19px] font-medium tracking-tight text-white/90 font-sans">
      Google
    </span>
  );
}

function AWSLogo() {
  return (
    <div className="flex items-center">
      <svg viewBox="0 0 45 22" className="h-6" fill="currentColor">
        <text x="0" y="14" fontSize="15" fontWeight="700" fontStyle="italic" letterSpacing="0.5">aws</text>
        <path d="M1 18c10 4 24 4 34-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M31 16l4 2-1-3" fill="currentColor" />
      </svg>
    </div>
  );
}

function MicrosoftLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid grid-cols-2 gap-0.5">
        <div className="h-2.5 w-2.5 bg-white/90" />
        <div className="h-2.5 w-2.5 bg-white/90" />
        <div className="h-2.5 w-2.5 bg-white/90" />
        <div className="h-2.5 w-2.5 bg-white/90" />
      </div>
      <span className="text-[16px] font-normal tracking-tight text-white/90">Microsoft</span>
    </div>
  );
}

const LOGOS = [
  { name: "OpenAI", component: OpenAILogo },
  { name: "Anthropic", component: AnthropicLogo },
  { name: "Meta", component: MetaLogo },
  { name: "Google", component: GoogleLogo },
  { name: "AWS", component: AWSLogo },
  { name: "Microsoft", component: MicrosoftLogo },
];

export function TrustedSection() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      <Container>
        <div className="flex flex-col items-center">
          {/* Badge matching reference */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-white/70 backdrop-blur-xl"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Trusted by Innovators
          </motion.div>

          {/* Logo row matching reference design */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-10 flex w-full flex-wrap items-center justify-center gap-10 md:gap-14 lg:gap-16 opacity-75 transition-opacity duration-300 hover:opacity-100"
          >
            {LOGOS.map((logo) => {
              const Comp = logo.component;
              return (
                <div
                  key={logo.name}
                  className="flex items-center transition-all duration-300 hover:scale-105 hover:opacity-100"
                >
                  <Comp />
                </div>
              );
            })}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}