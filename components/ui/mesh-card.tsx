"use client";

import { useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type MeshTheme = {
  /** Primary color (6-digit hex). */
  primary: string;
  /** Secondary color (6-digit hex). */
  secondary: string;
  /** Color used for the hover glow + accent blob. */
  glow: string;
};

type MeshCardProps = {
  theme: MeshTheme;
  icon: ReactNode;
  title: string;
  description: string;
  learnMoreHref?: string;
  className?: string;
};

/**
 * MeshCard — a 3D-feeling card with an organic, slowly-swirling animated
 * gradient. Uses CSS mesh gradients + Framer Motion (GPU-composited) rather
 * than per-card WebGL so 6+ cards on screen stay cheap to paint.
 */
export function MeshCard({
  theme,
  icon,
  title,
  description,
  learnMoreHref = "#contact",
  className,
}: MeshCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  /* Subtle 3D tilt driven by cursor position */
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), {
    stiffness: 160,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), {
    stiffness: 160,
    damping: 22,
  });

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top) / r.height);
  };

  const handleLeave = () => {
    setHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  /* Blob drift slows down → speeds up slightly on hover */
  const drift = hovered ? 7 : 14;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      whileHover={reduce ? undefined : { y: -6 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={cn("group relative h-full will-change-transform", className)}
    >
      <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
        {/* Organic mesh gradient layer */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {/* Static base wash — keeps the theme visible before blobs drift */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(110% 110% at 18% 15%, ${theme.primary}4d 0%, transparent 52%), radial-gradient(110% 110% at 85% 30%, ${theme.secondary}40 0%, transparent 52%)`,
            }}
          />
          {/* Drifting blobs — the "swirl" */}
          <motion.div
            className="absolute -left-[20%] -top-[20%] h-[75%] w-[75%] rounded-full blur-3xl will-change-transform"
            style={{
              background: `radial-gradient(circle, ${theme.primary}80, transparent 70%)`,
            }}
            animate={{
              x: [0, 30, -15, 0],
              y: [0, -18, 22, 0],
              scale: [1, 1.25, 0.92, 1],
              opacity: [0.5, 0.85, 0.55, 0.5],
            }}
            transition={{
              duration: drift,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-[22%] -right-[18%] h-[80%] w-[80%] rounded-full blur-3xl will-change-transform"
            style={{
              background: `radial-gradient(circle, ${theme.secondary}80, transparent 70%)`,
            }}
            animate={{
              x: [0, -25, 15, 0],
              y: [0, 20, -12, 0],
              scale: [1, 1.15, 1.3, 1],
              opacity: [0.45, 0.8, 0.5, 0.45],
            }}
            transition={{
              duration: drift * 1.25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute left-[30%] top-[55%] h-[45%] w-[45%] rounded-full blur-2xl will-change-transform"
            style={{
              background: `radial-gradient(circle, ${theme.glow}59, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.25, 0.9, 1],
              opacity: [0.3, 0.55, 0.3, 0.3],
            }}
            transition={{
              duration: drift * 0.85,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Hover glow (theme-tinted) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: `0 0 30px -6px ${theme.glow}66, inset 0 0 0 1px ${theme.glow}55`,
          }}
        />

        {/* Content */}
        <div className="relative flex h-full flex-col p-7">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white ring-1 ring-white/10">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-white/90">
            {description}
          </p>
          <a
            href={learnMoreHref}
            className="group/link mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/75 transition-colors hover:text-white"
          >
            Learn more
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
