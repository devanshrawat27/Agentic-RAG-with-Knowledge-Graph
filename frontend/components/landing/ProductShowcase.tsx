"use client";

import { motion } from "framer-motion";
import { Container, SectionHeading } from "./primitives";
import { DashboardPreview } from "./DashboardPreview";

export function ProductShowcase() {
  return (
    <section id="showcase" className="relative py-24 md:py-32">
      {/* Section divider glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeading
            badge="Turn Information into Intelligence"
            title={
              <>
                More than Search —{" "}
                <span className="bg-gradient-to-r from-white to-white/35 bg-clip-text text-transparent">
                  Understand, Connect, Discover.
                </span>
              </>
            }
            description={
              <>
                TrueDocs doesn&apos;t just find text. It understands your
                documents, builds a knowledge graph, and gives you accurate,
                context-aware answers with sources.
              </>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="mt-14 md:mt-20"
        >
          <DashboardPreview />
        </motion.div>
      </Container>
    </section>
  );
}