"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Per-card accent: `hex` drives the border glow + icon glow + tint spot 1,
    `glow` tints the hover shadow, `badgeGlow` colors the icon halo, and the
    optional `tint2` gives the second radial tint a different color (Showcase
    cards use their secondary theme color). */
export type GlassAccent = {
  hex: string;
  glow: string;
  badgeGlow: string;
  tint2?: string;
};

type GlassCardProps = {
  accent: GlassAccent;
  /** Whether the parent (tilt wrapper) is hovered — drives border/shadow glow. */
  hovered: boolean;
  icon?: ReactNode;
  /** Extra classes for the icon badge (e.g. the accent icon color classes). */
  iconClassName?: string;
  title?: string;
  description?: string;
  /** Optional footer content after the description (e.g. a "Learn more" link). */
  children?: ReactNode;
  className?: string;
};

/**
 * GlassCard — the shared frosted-glass panel used by the Features and Showcase
 * cards over their background videos. `glass-surface` supplies the backdrop
 * blur (with a solid fallback on touch), while the accent tint + top-edge
 * highlight sit under the content. The panel is intentionally self-contained:
 * the parent's 3D tilt lives in the wrapping motion.div; everything inside is
 * the glass pane itself.
 */
export function GlassCard({
  accent,
  hovered,
  icon,
  iconClassName,
  title,
  description,
  children,
  className,
}: GlassCardProps) {
  const reduce = useReducedMotion();
  const tint2 = accent.tint2 ?? accent.hex;

  return (
    <div
      className={cn(
        "glass-surface relative h-full overflow-hidden rounded-3xl border bg-white/[0.06] shadow-lg shadow-black/25 transition-all duration-300 hover:bg-white/[0.12]",
        className
      )}
      style={{
        borderColor: hovered ? `${accent.hex}66` : "rgba(255,255,255,0.18)",
        boxShadow: hovered
          ? `0 1px 2px rgba(0,0,0,0.6), 0 12px 32px -12px rgba(0,0,0,0.7), 0 0 48px -10px ${accent.glow}`
          : `0 1px 2px rgba(0,0,0,0.5), 0 8px 24px -14px rgba(0,0,0,0.6)`,
      }}
    >
      {/* Faint accent tint — under the content, over the frosted video, so cards
          stay distinguishable while remaining translucent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(120% 130% at 12% 8%, ${accent.hex}1f 0%, transparent 55%), radial-gradient(120% 130% at 92% 96%, ${tint2}17 0%, transparent 55%)`,
        }}
      />
      {/* Top edge highlight — thin light line, like light catching glass */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-3 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
        }}
      />
      {/* Grain / noise overlay (very faint, keeps the premium tactile feel) */}
      <div aria-hidden className="noise-overlay pointer-events-none absolute inset-0" />

      {/* Content */}
      <div className="relative flex h-full flex-col p-8">
        {icon ? (
          <div className="relative mb-7 inline-flex h-14 w-14 items-center justify-center">
            <div
              aria-hidden
              className="absolute -inset-2.5 rounded-2xl opacity-60 blur-lg transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: accent.badgeGlow }}
            />
            <div
              className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm ring-1 ring-white/10 transition-colors duration-300 ${iconClassName ?? ""}`}
            >
              <motion.div
                animate={
                  reduce ? undefined : { scale: hovered ? 1.12 : 1, rotate: hovered ? -6 : 0 }
                }
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {icon}
              </motion.div>
            </div>
          </div>
        ) : null}
        {title ? (
          <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
        ) : null}
        {description ? (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
