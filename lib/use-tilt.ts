"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

/* True only on devices with a real hover pointer (desktop). 3D tilt stays off
   on touch — there is no hover there and the synthetic mouse events would only
   produce jumpy flicks. Scroll entrances are unaffected. */
export function useIsHoverCapable(): boolean {
  const [capable, setCapable] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCapable(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCapable(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return capable;
}

/**
 * 3D tilt driven by cursor position, spring-smoothed so it feels weighty.
 * When `enabled` is false (touch / reduced motion) the handlers become
 * no-ops and the rotation values stay at 0.
 */
export function useTilt(enabled = true, maxAngle = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [maxAngle, -maxAngle]), {
    stiffness: 200,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-maxAngle, maxAngle]), {
    stiffness: 200,
    damping: 18,
  });

  const onMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!enabled) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      mouseX.set((e.clientX - r.left) / r.width);
      mouseY.set((e.clientY - r.top) / r.height);
    },
    [enabled, mouseX, mouseY]
  );

  const onMouseEnter = useCallback(() => setHovered(true), []);
  const onMouseLeave = useCallback(() => {
    setHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return { ref, hovered, rotateX, rotateY, onMouseMove, onMouseEnter, onMouseLeave };
}
