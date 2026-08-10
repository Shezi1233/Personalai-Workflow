"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  /** Extra classes for the tracking wrapper (sizing / positioning). */
  className?: string;
  /** Radial glow color (any CSS color). Defaults to a soft white. */
  fill?: string;
  /** Content rendered above the spotlight glow. */
  children?: ReactNode;
}

/**
 * Spotlight — a mouse-following radial glow driven by spring physics.
 * Wrap a Card (or an entire hero) in it; the glow trails the cursor
 * behind whatever is rendered as children.
 */
export function Spotlight({ className, fill, children }: SpotlightProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setIsHovering(isHovered);
  }, [isHovered]);

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const x = useSpring(mousePosition.x, springConfig);
  const y = useSpring(mousePosition.y, springConfig);

  const spotlightLeft = useTransform(x, [0, 1], ["-25%", "125%"]);
  const spotlightTop = useTransform(y, [0, 1], ["-25%", "125%"]);

  const handleMouseMove = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!divRef.current) return;
      const rect = divRef.current.getBoundingClientRect();
      setMousePosition({
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      });
    },
    []
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <motion.div
      ref={divRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className={cn("relative", className)}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <motion.div
          className="absolute h-[300px] w-[300px] rounded-full blur-[60px]"
          style={{
            left: spotlightLeft,
            top: spotlightTop,
            opacity: isHovering ? 1 : 0,
            background: `radial-gradient(circle at center, ${
              fill ?? "rgba(255,255,255,0.5)"
            } 0%, transparent 70%)`,
          }}
        />
      </motion.div>
      {children}
    </motion.div>
  );
}
