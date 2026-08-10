"use client";

import {
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
} from "framer-motion";
import { Spotlight } from "./spotlight";
import { SplineScene } from "./splite";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

type HeroFuturisticProps = {
  headline?: string;
  accentWord?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

const defaultProps: HeroFuturisticProps = {
  headline: "Ready to build something extraordinary?",
  accentWord: "extraordinary",
  subtitle: "AI-powered creativity for the next generation.",
  primaryCta: "Book a free consult",
  secondaryCta: "See what's possible",
};

/* ------------------------------------------------------------------ */
/*  Shared motion variants (premium easing everywhere)                  */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.13, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: easeOutExpo },
  },
};

/* ------------------------------------------------------------------ */
/*  Tactile 3D button: hover glow + scale, tap press, pointer tilt      */
/* ------------------------------------------------------------------ */
type TiltButtonProps = {
  href: string;
  label?: string;
  variant?: "primary" | "outline";
  withArrow?: boolean;
  className?: string;
};

function TiltButton({
  href,
  label = "",
  variant = "primary",
  withArrow = false,
  className = "",
}: TiltButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMove = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotateY.set(px * 10);
    rotateX.set(-py * 10);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setHovered(false);
  };

  const isPrimary = variant === "primary";

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 600 }}
      whileHover={
        reduce
          ? undefined
          : {
              scale: 1.05,
              boxShadow: isPrimary
                ? "0 0 60px rgba(255,255,255,0.35)"
                : "0 0 40px rgba(139,92,246,0.35), inset 0 0 20px rgba(139,92,246,0.06)",
            }
      }
      whileTap={reduce ? undefined : { scale: 0.97 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold transition-colors duration-300 ${
        isPrimary
          ? "bg-white text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.25)]"
          : "border border-white/20 bg-white/5 text-white hover:border-indigo-400/60 hover:bg-white/10"
      } ${className}`}
    >
      {label}
      {withArrow && (
        <motion.span
          className="inline-flex"
          animate={{ x: hovered ? 5 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
        >
          →
        </motion.span>
      )}
    </motion.a>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero — two columns: copy (60%) + Spline 3D scene (40%)             */
/* ------------------------------------------------------------------ */
const SPLINE_SCENE_URL =
  "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

const HeroFuturistic = ({
  headline = defaultProps.headline,
  accentWord = defaultProps.accentWord,
  subtitle = defaultProps.subtitle,
  primaryCta = defaultProps.primaryCta,
  secondaryCta = defaultProps.secondaryCta,
}: HeroFuturisticProps) => {
  const reduceMotion = useReducedMotion();
  const motionEnabled = !reduceMotion;
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Mobile detection → lighter, CSS/Framer-only background on small screens
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Split the headline on the accent word so only it gets the gradient
  const { headStart, headRest, hasAccent } = useMemo(() => {
    const text = headline ?? "";
    if (!accentWord) return { headStart: text, headRest: "", hasAccent: false };
    const parts = text.split(accentWord);
    return {
      headStart: parts[0] ?? text,
      headRest: parts.slice(1).join(""),
      hasAccent: parts.length > 1,
    };
  }, [headline, accentWord]);

  /* Deterministic PRNG (seeded) — keeps the render pure while still
     producing varied particle layouts. */
  const mulberry32 = useMemo(
    () => (seed: number) => {
      let s = seed;
      return () => {
        s |= 0;
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    []
  );

  /* Floating particles — low count, very low opacity, slow drift */
  const particles = useMemo(() => {
    const rand = mulberry32(isMobile ? 1234 : 42);
    const count = isMobile ? 12 : 26;
    return Array.from({ length: count }, () => ({
      left: rand() * 100,
      top: 20 + rand() * 60,
      size: 1.5 + rand() * 2.5,
      duration: 9 + rand() * 12,
      delay: rand() * 8,
      drift: -22 + rand() * 44,
      opacity: 0.12 + rand() * 0.35,
    }));
  }, [isMobile, mulberry32]);

  /* Mouse parallax — background layers drift gently opposite the cursor */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const bgParallaxX = useSpring(useTransform(mouseX, [0, 1], [28, -28]), {
    stiffness: 50,
    damping: 20,
  });
  const bgParallaxY = useSpring(useTransform(mouseY, [0, 1], [22, -22]), {
    stiffness: 50,
    damping: 20,
  });

  /* Deeper orbs move a little more — layered parallax depth */
  const orbX = useSpring(useTransform(mouseX, [0, 1], [40, -40]), {
    stiffness: 45,
    damping: 22,
  });
  const orbY = useSpring(useTransform(mouseY, [0, 1], [34, -34]), {
    stiffness: 45,
    damping: 22,
  });
  const orb2X = useSpring(useTransform(mouseX, [0, 1], [-26, 26]), {
    stiffness: 45,
    damping: 22,
  });
  const orb2Y = useSpring(useTransform(mouseY, [0, 1], [-22, 22]), {
    stiffness: 45,
    damping: 22,
  });

  /* Scroll parallax — hero content fades + drifts as you scroll past */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const bgScrollY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const handleSectionMouseMove = (e: ReactMouseEvent<HTMLElement>) => {
    if (!motionEnabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top) / r.height);
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      onMouseMove={handleSectionMouseMove}
      aria-label="Hero"
      className="relative min-h-svh w-full overflow-hidden bg-black/[0.96] lg:h-svh"
    >
      {/* Ambient background layers (scroll + mouse parallax) */}
      <motion.div
        style={{ y: bgScrollY }}
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <motion.div
          style={{ x: bgParallaxX, y: bgParallaxY }}
          className="absolute inset-0"
        >
          <div className="hero-grid absolute inset-0" />

          {/* Breathing gradient orb #1 (purple → blue) */}
          <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="h-full w-full rounded-full"
              style={{
                x: orbX,
                y: orbY,
                background:
                  "radial-gradient(circle at 35% 35%, rgba(139,92,246,0.38), rgba(99,102,241,0.16) 45%, transparent 72%)",
                filter: "blur(46px)",
              }}
              animate={
                motionEnabled
                  ? { scale: [1, 1.12, 1], opacity: [0.65, 0.95, 0.65] }
                  : undefined
              }
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Secondary accent orb (blue/cyan, offset — counter-parallax) */}
          <div className="absolute left-[62%] top-[58%] h-[38vmin] w-[38vmin] -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="h-full w-full rounded-full"
              style={{
                x: orb2X,
                y: orb2Y,
                background:
                  "radial-gradient(circle at 40% 40%, rgba(56,189,248,0.28), rgba(59,130,246,0.12) 45%, transparent 70%)",
                filter: "blur(40px)",
              }}
              animate={
                motionEnabled
                  ? { scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }
                  : undefined
              }
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Floating particles (very low opacity, slow drift) */}
          {motionEnabled &&
            particles.map((p, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-indigo-300 will-change-transform"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: p.size,
                  height: p.size,
                  boxShadow: "0 0 8px rgba(129,140,248,0.5)",
                }}
                initial={{ y: 0, opacity: 0 }}
                animate={{
                  y: [0, -70],
                  x: [0, p.drift],
                  opacity: [0, p.opacity, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}

          <div className="hero-noise absolute inset-0" />
        </motion.div>
      </motion.div>

      {/* Copy + full-bleed Spline — scroll parallax wrapper → entrance */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="pointer-events-none relative z-20 flex flex-col pt-28 lg:absolute lg:inset-0 lg:justify-center lg:pt-0"
      >
        {/* LEFT — copy (~54%) */}
        <motion.div
          initial={motionEnabled ? { opacity: 0, y: 28 } : false}
          animate={motionEnabled ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.1 }}
          className="pointer-events-auto relative z-10 flex w-full flex-col items-start justify-center px-6 lg:h-full lg:w-[54%] lg:px-8 lg:pr-10"
        >
          <motion.div
            initial={motionEnabled ? "hidden" : false}
            animate={motionEnabled ? "visible" : false}
            variants={containerVariants}
            className="flex w-full flex-col items-start"
          >
                <motion.div
                  variants={itemVariants}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-slate-200 backdrop-blur"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Next-level studio
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
                >
                  {headStart}
                  {hasAccent && <span className="glitch-text">{accentWord}</span>}
                  {headRest}
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="mt-6 max-w-xl text-base font-medium text-slate-300 sm:text-lg lg:text-xl"
                >
                  {subtitle}
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="pointer-events-auto mt-10 flex flex-col items-start gap-4 sm:flex-row"
                >
                  <TiltButton
                    href="#contact"
                    label={primaryCta}
                    variant="primary"
                    withArrow
                  />
                  <TiltButton
                    href="#features"
                    label={secondaryCta}
                    variant="outline"
                  />
                </motion.div>
              </motion.div>
            </motion.div>

        {/* RIGHT — full-bleed 3D scene, borderless (~46%) */}
        <motion.div
          initial={motionEnabled ? { opacity: 0, scale: 0.96 } : false}
          animate={motionEnabled ? { opacity: 1, scale: 1 } : false}
          transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.3 }}
          className="pointer-events-auto relative h-[300px] w-full overflow-hidden sm:h-[360px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[46%]"
        >
          <Spotlight className="h-full w-full" fill="rgba(139, 92, 246, 0.3)">
            <div className="relative h-full w-full overflow-hidden">
              <SplineScene
                scene={SPLINE_SCENE_URL}
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </Spotlight>
        </motion.div>
      </motion.div>

      {/* Scroll to explore */}
      <button
        type="button"
        className="explore-btn"
        style={{ animationDelay: "2.2s" }}
        onClick={() =>
          document
            .getElementById("showcase")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        Scroll to explore
        <span className="explore-arrow">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="arrow-svg"
            aria-hidden="true"
          >
            <path d="M11 5V17" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 12L11 17L16 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </button>
    </section>
  );
};

export { HeroFuturistic };
export type { HeroFuturisticProps };
export default HeroFuturistic;
