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
  eyebrow?: string;
  headline?: string;
  accentWord?: string;
  gradientLine?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  primaryCtaHref?: string;
  secondaryCtaHref?: string;
};

const defaultProps: HeroFuturisticProps = {
  eyebrow: "Available for work",
  headline: "Hi, I'm Malik Shahzad",
  gradientLine: "Full-Stack Developer & AI Engineer",
  subtitle:
    "Full-stack developer specializing in Next.js, Tailwind CSS, Python, and Neon PostgreSQL — with a growing focus on AI. Building RAG chatbots, AI voice agents, and autonomous AI agents.",
  primaryCta: "View My Work",
  secondaryCta: "Download CV",
  primaryCtaHref: "#projects",
  secondaryCtaHref: "/resume.pdf",
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
/*  Typewriter — cycles through roles as "I am a <role>…"               */
/* ------------------------------------------------------------------ */
const TYPED_ROLES = [
  "Full-Stack Developer",
  "RAG Chatbot Creator",
  "YouTube Viral Shorts Creator",
  "Amazon Ebooks Creator",
  "Amazon Viral Coloring Book Creator",
  "Canva Editor",
  "CapCut Editor",
  "Automation Agents Builder",
];

/* Widest string reserves the line's height, so short roles never make the
   subtitle / CTAs below jump as the text length changes. */
const LONGEST_ROLE = TYPED_ROLES.reduce((a, b) =>
  b.length > a.length ? b : a
);

function Typewriter() {
  const reduce = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);
  const [len, setLen] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused] = useState(false);

  /* One re-scheduled timer drives type → pause → delete → next role.
     Typing ~60ms/char, deleting ~35ms/char, hold ~1.8s when complete.
     Starts ~1s after mount so the fade-in entrance finishes first. */
  useEffect(() => {
    if (reduce) return;

    if (!started) {
      const id = setTimeout(() => setStarted(true), 1000);
      return () => clearTimeout(id);
    }

    const current = TYPED_ROLES[roleIndex];
    const delay = paused ? 1800 : deleting ? 35 : 60;

    const id = setTimeout(() => {
      if (paused) {
        setPaused(false);
        setDeleting(true);
      } else if (!deleting) {
        const next = len + 1;
        setLen(next);
        if (next === current.length) setPaused(true);
      } else {
        const next = len - 1;
        setLen(next);
        if (next === 0) {
          setDeleting(false);
          setRoleIndex((r) => (r + 1) % TYPED_ROLES.length);
        }
      }
    }, delay);

    return () => clearTimeout(id);
  }, [reduce, started, roleIndex, len, deleting, paused]);

  const displayRole = reduce
    ? TYPED_ROLES[0]
    : TYPED_ROLES[roleIndex].slice(0, len);

  return (
    <>
      {/* The cycling text is decorative — hidden from screen readers. The
          full static role list is exposed via the sr-only line below. */}
      <div className="grid" aria-hidden="true">
        {/* Invisible spacer of the widest role — reserves exactly the height
            the line can reach at any breakpoint, so nothing below jumps. */}
        <p className="col-start-1 row-start-1 invisible text-xl font-medium sm:text-2xl lg:text-3xl">
          I am a {LONGEST_ROLE}
        </p>
        <p className="col-start-1 row-start-1 text-xl font-medium sm:text-2xl lg:text-3xl">
          <span className="text-slate-300">I am a&nbsp;</span>
          <span className="typewriter-role">{displayRole}</span>
          <motion.span
            className="typewriter-cursor ml-0.5"
            animate={reduce ? undefined : { opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          >
            |
          </motion.span>
        </p>
      </div>
      <span className="sr-only">
        I am a Full-Stack Developer, RAG Chatbot Creator, YouTube Viral Shorts
        Creator, Amazon Ebooks Creator, Amazon Viral Coloring Book Creator,
        Canva Editor, CapCut Editor, and Automation Agents Builder.
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero — two columns: copy (60%) + Spline 3D scene (40%)             */
/* ------------------------------------------------------------------ */
const SPLINE_SCENE_URL =
  "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

const HeroFuturistic = ({
  eyebrow = defaultProps.eyebrow,
  headline = defaultProps.headline,
  accentWord = defaultProps.accentWord,
  gradientLine = defaultProps.gradientLine,
  subtitle = defaultProps.subtitle,
  primaryCta = defaultProps.primaryCta,
  secondaryCta = defaultProps.secondaryCta,
  primaryCtaHref = defaultProps.primaryCtaHref,
  secondaryCtaHref = defaultProps.secondaryCtaHref,
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
                  {eyebrow}
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
                >
                  {headStart}
                  {hasAccent && <span className="glitch-text">{accentWord}</span>}
                  {headRest}
                  {gradientLine ? (
                    <span className="mt-2 block glitch-text lg:mt-3">
                      {gradientLine}
                    </span>
                  ) : null}
                </motion.h1>

                <motion.div variants={itemVariants} className="mt-3">
                  <Typewriter />
                </motion.div>

                <motion.p
                  variants={itemVariants}
                  className="mt-4 max-w-xl text-base font-medium text-slate-300 sm:text-lg lg:text-xl"
                >
                  {subtitle}
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="pointer-events-auto mt-10 flex flex-col items-start gap-4 sm:flex-row"
                >
                  <TiltButton
                    href={primaryCtaHref ?? "#projects"}
                    label={primaryCta}
                    variant="primary"
                    withArrow
                  />
                  <TiltButton
                    href={secondaryCtaHref ?? "/resume.pdf"}
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
            .getElementById("projects")
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
