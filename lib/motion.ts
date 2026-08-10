"use client";

import { useScroll, useTransform, type MotionValue, type Variants } from "framer-motion";
import type { RefObject } from "react";

/* Shared easing used across scroll-driven entrances */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/* Headings: fade-up with a slight blur-to-focus */
export const fadeUpBlur: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: easeOutExpo },
  },
};

/* Grids: stagger children on scroll (0.1s between each card) */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

/* Cards: fade-up + scale from 0.95 */
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

/* Reduced-motion fallback: opacity only */
export const fadeOnlyVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

/* Layered-depth parallax: content drifts at its own pace vs. the scroll.
   Attach one of these per layer (content / orbs) with different ranges to
   get the "different speed" depth feel. */
export function useSectionParallax(
  ref: RefObject<HTMLElement | null>,
  range: [number, number] = [40, -40]
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  return useTransform(scrollYProgress, [0, 1], range);
}
