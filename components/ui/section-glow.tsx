"use client";

import { motion, type MotionValue } from "framer-motion";

type GlowVariant = "indigo" | "fuchsia" | "emerald" | "rose" | "violet";

const GLOW_COLORS: Record<GlowVariant, [string, string]> = {
  indigo: ["rgba(139,92,246,0.22)", "rgba(99,102,241,0.10)"],
  fuchsia: ["rgba(217,70,239,0.20)", "rgba(192,38,211,0.10)"],
  emerald: ["rgba(52,211,153,0.20)", "rgba(16,185,129,0.10)"],
  rose: ["rgba(251,113,133,0.18)", "rgba(225,29,72,0.10)"],
  violet: ["rgba(167,139,250,0.22)", "rgba(139,92,246,0.10)"],
};

type SectionGlowProps = {
  y?: MotionValue<number>;
  variant?: GlowVariant;
};

/** Soft blurred orb behind a section heading — keeps the hero's glow language
    flowing through the rest of the page. Pure decoration, pointer-transparent,
    and cheap to paint (single blurred div). */
export function SectionGlow({ y, variant = "indigo" }: SectionGlowProps) {
  const [c1, c2] = GLOW_COLORS[variant];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 top-28 flex justify-center">
        <motion.div style={{ y }} className="h-[42vmin] w-[42vmin] rounded-full blur-[60px]">
          <div
            className="h-full w-full rounded-full"
            style={{
              background: `radial-gradient(circle at 40% 40%, ${c1}, ${c2} 45%, transparent 70%)`,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
