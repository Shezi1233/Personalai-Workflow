"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeOnlyVariants, fadeUpBlur, staggerContainer } from "@/lib/motion";

type SectionHeadingProps = {
  eyebrow: string;
  eyebrowClassName?: string;
  title: ReactNode;
  subtext?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * Section heading — eyebrow / title / subtext fade-up with a blur-to-focus
 * as the block scrolls into view (staggered, once). Optional `action` slot
 * for a right-aligned link (Showcase).
 */
export function SectionHeading({
  eyebrow,
  eyebrowClassName = "text-indigo-400",
  title,
  subtext,
  action,
  className,
}: SectionHeadingProps) {
  const reduce = useReducedMotion();
  const itemVariants = reduce ? fadeOnlyVariants : fadeUpBlur;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={className}
    >
      <motion.p
        variants={itemVariants}
        className={`text-sm font-semibold uppercase tracking-[0.2em] ${eyebrowClassName}`}
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        variants={itemVariants}
        className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
      >
        {title}
      </motion.h2>
      {subtext ? (
        <motion.p
          variants={itemVariants}
          className="mt-4 text-base text-slate-400 sm:text-lg"
        >
          {subtext}
        </motion.p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}
