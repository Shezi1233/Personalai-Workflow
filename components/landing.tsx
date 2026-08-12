"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Code,
  Code2,
  Cpu,
  Database,
  GraduationCap,
  Briefcase,
  Calendar,
  Layers,
  Mail,
  MapPin,
  Mic,
  Palette,
  PenTool,
  Phone,
  PlayCircle,
  Send,
  Sparkles,
  Users,
  Wand2,
  Wrench,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { GlassAccent } from "@/components/ui/glass-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { BackgroundVideo } from "@/components/ui/background-video";
import { SectionGlow } from "@/components/ui/section-glow";
import {
  cardVariants,
  fadeOnlyVariants,
  fadeUpBlur,
  staggerContainer,
  useSectionParallax,
} from "@/lib/motion";
import { useIsHoverCapable, useTilt } from "@/lib/use-tilt";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/* Backend base URL. Override via NEXT_PUBLIC_API_URL when the API is deployed. */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ---------------------------------------------------------------- */
/*  Reusable scroll-reveal wrapper                                    */
/* ---------------------------------------------------------------- */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: easeOutExpo }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */
/*  Nav                                                                */
/* ---------------------------------------------------------------- */
const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

/* Nav link with an animated underline that slides in from the left */
function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="group relative text-sm text-slate-300 transition-colors duration-300 hover:text-white"
    >
      {label}
      <span
        className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 transition-transform duration-300 ease-out group-hover:scale-x-100"
        aria-hidden="true"
      />
    </a>
  );
}

function Nav() {
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: easeOutExpo }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/60 backdrop-blur-xl"
          : "border-b border-white/5 bg-black/20 backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <a href="#hero" className="flex items-center gap-2 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-black text-white">
            MS
          </span>
          <span className="text-sm font-bold tracking-tight">Malik Shahzad</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} label={link.label} href={link.href} />
          ))}
        </div>

        {/* Sign In (subtle text link) + Hire Me — same row, right-aligned */}
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="group relative hidden text-sm text-slate-300 transition-colors duration-300 hover:text-white md:inline-block"
          >
            Sign In
            <span
              className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 transition-transform duration-300 ease-out group-hover:scale-x-100"
              aria-hidden="true"
            />
          </Link>

          <motion.a
            href="#contact"
            whileHover={reduceMotion ? undefined : { scale: 1.05 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            Hire Me
          </motion.a>
        </div>
      </nav>
    </motion.header>
  );
}

/* ---------------------------------------------------------------- */
/*  About                                                              */
/* ---------------------------------------------------------------- */
const HIGHLIGHTS = [
  {
    stat: "2 Years",
    label: "Governor Initiative",
    accent: { hex: "#8b5cf6", glow: "rgba(139,92,246,0.45)" },
  },
  {
    stat: "3+",
    label: "AI Projects Shipped",
    accent: { hex: "#22d3ee", glow: "rgba(34,211,238,0.45)" },
  },
  {
    stat: "Full-Stack",
    label: "+ AI Skillset",
    accent: { hex: "#e879f9", glow: "rgba(232,121,249,0.45)" },
  },
];

/* ---------------------------------------------------------------- */
/*  Typewriter heading — types "Full-Stack Developer meets AI        */
/*  Engineer" char-by-char when scrolled into view (once), keeping   */
/*  the white / gradient span split, with a blinking cursor.         */
/* ---------------------------------------------------------------- */
const TYPE_PREFIX = "Full-Stack Developer ";
const TYPE_ACCENT = "meets AI Engineer";
const TYPE_TOTAL = TYPE_PREFIX.length + TYPE_ACCENT.length;

function TypewriterHeading() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (reduce || !inView || typed >= TYPE_TOTAL) return;
    const id = setTimeout(() => setTyped((t) => t + 1), 50);
    return () => clearTimeout(id);
  }, [inView, typed, reduce]);

  const full = Boolean(reduce);
  const prefixShown = full
    ? TYPE_PREFIX
    : TYPE_PREFIX.slice(0, Math.min(typed, TYPE_PREFIX.length));
  const accentShown = full
    ? TYPE_ACCENT
    : TYPE_ACCENT.slice(0, Math.max(0, typed - TYPE_PREFIX.length));
  const cursorOn = !full && typed < TYPE_TOTAL;

  return (
    <h3
      ref={ref}
      aria-label={`${TYPE_PREFIX}${TYPE_ACCENT}`}
      className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
    >
      {prefixShown}
      <span className="glitch-text">{accentShown}</span>
      {cursorOn && (
        <motion.span
          className="typewriter-cursor ml-1"
          aria-hidden="true"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        >
          |
        </motion.span>
      )}
    </h3>
  );
}

/* ---------------------------------------------------------------- */
/*  StatCard — counts up numeric stats (ease-out), bounce-in for     */
/*  text stats. Staggered by index.                                  */
/* ---------------------------------------------------------------- */
function StatCard({
  item,
  index,
  inView,
}: {
  item: (typeof HIGHLIGHTS)[number];
  index: number;
  inView: boolean;
}) {
  const reduce = useReducedMotion();
  const delay = index * 0.15;

  const numeric = item.stat.match(/^(\d+)(.*)$/);
  const numericTarget = numeric ? parseInt(numeric[1], 10) : null;
  const numericSuffix = numeric ? numeric[2] : "";

  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  useMotionValueEvent(count, "change", (latest) =>
    setDisplay(Math.round(latest))
  );

  useEffect(() => {
    if (!inView || numericTarget === null) return;
    if (reduce) {
      count.set(numericTarget);
      return;
    }
    const controls = animate(count, numericTarget, {
      duration: 1.2,
      ease: "easeOut",
      delay,
    });
    return controls.stop;
  }, [inView, numericTarget, reduce, delay, count]);

  let statContent: React.ReactNode;
  if (numericTarget === null) {
    /* Non-numeric stat (e.g. "Full-Stack") → playful bounce-in */
    statContent = (
      <motion.div
        className="relative text-xl font-extrabold tracking-tight sm:text-2xl"
        style={{ color: item.accent.hex }}
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: [0, 1.1, 1], opacity: 1 } : {}}
        transition={{ delay: delay + 0.25, duration: 0.6, ease: "easeOut" }}
      >
        {item.stat}
      </motion.div>
    );
  } else if (reduce) {
    statContent = (
      <div
        className="relative text-xl font-extrabold tracking-tight sm:text-2xl"
        style={{ color: item.accent.hex }}
      >
        {item.stat}
      </div>
    );
  } else {
    statContent = (
      <div
        className="relative text-xl font-extrabold tracking-tight sm:text-2xl"
        style={{ color: item.accent.hex }}
      >
        <span>{display}</span>
        {numericSuffix}
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors duration-300 hover:border-white/20">
      <div
        aria-hidden
        className="absolute -inset-x-4 -top-10 h-20 opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
        style={{ background: item.accent.glow }}
      />
      {statContent}
      <div className="relative mt-1 text-xs font-medium text-slate-400">
        {item.label}
      </div>
    </div>
  );
}

function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const contentY = useSectionParallax(sectionRef, [40, -40]);
  const orbY = useSectionParallax(sectionRef, [-20, 20]);

  /* Counters trigger once when the stats row scrolls into view. */
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });

  /* Photo flip loops only while the section is on/near screen. */
  const flipInView = useInView(sectionRef, { margin: "100px" });
  const flipActive = !reduceMotion && flipInView;

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden bg-background py-24 sm:py-32"
    >
      <SectionGlow y={orbY} variant="indigo" />
      <div aria-hidden className="section-mesh pointer-events-none absolute inset-0" />

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8"
      >
        <SectionHeading
          eyebrow="About"
          eyebrowClassName="text-indigo-400"
          title="Nice to meet you"
          subtext="A developer who bridges clean, modern engineering with the frontier of applied AI."
          className="mx-auto max-w-2xl text-center"
        />

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Profile photo — animated RGB border + 3D flip */}
          <Reveal className="relative">
            <div className="relative mx-auto w-full max-w-sm">
              {/* Soft glow — blurred conic behind, so the ring looks like it
                  emanates light rather than a hard colored line */}
              <div
                aria-hidden
                className="absolute -inset-5 rounded-[2.75rem] opacity-60 blur-2xl"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(139,92,246,0.5), rgba(59,130,246,0.35), rgba(34,211,238,0.45), rgba(236,72,153,0.4), rgba(139,92,246,0.5))",
                }}
              />
              {/* Rotating RGB border ring — conic gradient cycling 360° (~5s).
                  Stays outside the flip, so it's always visible. */}
              <div className="relative overflow-hidden rounded-[calc(1.375rem+3px)] p-[3px] shadow-[0_24px_70px_-20px_rgba(0,0,0,0.85)]">
                <div aria-hidden className="rgb-border-ring absolute inset-0 z-0" />
                {/* Inner 3D flip — front: photo, back: MS logo badge.
                    The glass frame provides opaque backing so the RGB ring
                    shows only around the edge, with a small gap. */}
                <div className="relative z-10 rounded-3xl bg-background p-2 [perspective:1200px] [container-type:inline-size]">
                  <motion.div
                    style={{ transformStyle: "preserve-3d" }}
                    animate={
                      flipActive
                        ? { rotateY: [0, 180, 180, 360] }
                        : { rotateY: 0 }
                    }
                    transition={{
                      duration: 6,
                      times: [0, 0.17, 0.55, 1],
                      ease: "easeInOut",
                      repeat: flipActive ? Infinity : 0,
                      repeatDelay: 0,
                    }}
                    className="relative aspect-[4/5] w-full [transform-style:preserve-3d]"
                  >
                    {/* Front — the photo */}
                    <div
                      className="absolute inset-0 overflow-hidden rounded-2xl [backface-visibility:hidden]"
                    >
                      <img
                        src="/images/profile.png"
                        alt="Malik Shahzad — Full-Stack Developer & AI Engineer"
                        className="aspect-[4/5] w-full object-cover"
                      />
                    </div>

                    {/* Back — frosted-glass plaque lit by shifting RGB glow,
                        with the <MS/> logo cycling through the color spectrum */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      {/* Ambient RGB glow blobs — drift slowly behind the logo,
                          shifting purple → blue → cyan → magenta */}
                      <div aria-hidden className="absolute -inset-6">
                        <div className="flip-glow-a absolute left-[8%] top-[10%] h-[45%] w-[45%] rounded-full bg-violet-500/60 blur-2xl" />
                        <div className="flip-glow-b absolute right-[6%] top-[20%] h-[40%] w-[40%] rounded-full bg-blue-500/55 blur-2xl" />
                        <div className="flip-glow-c absolute bottom-[8%] left-[20%] h-[42%] w-[42%] rounded-full bg-cyan-400/50 blur-2xl" />
                        <div className="flip-glow-d absolute bottom-[14%] right-[14%] h-[38%] w-[38%] rounded-full bg-pink-500/50 blur-2xl" />
                      </div>

                      {/* The <MS/> logo — large, centered, hue-rotating RGB.
                          The source PNG has a black background baked in, so
                          mix-blend-screen makes black invisible against the
                          dark glass card while the logo lines stay visible.
                          No drop-shadow: on an opaque image it would follow the
                          full rectangle and draw a glowing box. */}
                      <div className="relative flex h-full w-full items-center justify-center p-6">
                        <img
                          src="/images/ms-logo.png"
                          alt="Malik Shahzad logo"
                          className="flip-logo h-auto w-[78%] select-none object-contain mix-blend-screen"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bio + highlight stats */}
          <Reveal delay={0.1}>
            <TypewriterHeading />
            <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
              Full-stack developer specializing in Next.js, Tailwind CSS,
              Python, and Neon PostgreSQL — with a growing focus on AI. I build
              RAG chatbots, AI voice agents, and autonomous AI agents (Claude
              CLI on OpenClaw), and I'm a 2-year member of the Governor
              Initiative program.
            </p>

            <div ref={statsRef} className="mt-9 grid gap-4 sm:grid-cols-3">
              {HIGHLIGHTS.map((h, i) => (
                <StatCard key={h.label} item={h} index={i} inView={statsInView} />
              ))}
            </div>
          </Reveal>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Skills                                                             */
/* ---------------------------------------------------------------- */
const SKILLS = [
  {
    icon: Code,
    title: "Full-Stack Development",
    tags: ["HTML/CSS", "JavaScript", "Next.js", "Tailwind CSS", "Python", "Neon PostgreSQL"],
    accent: {
      hex: "#818cf8",
      glow: "rgba(129,140,248,0.5)",
      badgeGlow: "rgba(129,140,248,0.25)",
      icon: "text-indigo-300 group-hover:text-indigo-200",
      ring: "group-hover:ring-indigo-400/50",
    },
  },
  {
    icon: Bot,
    title: "AI & Automation",
    tags: ["RAG Chatbots", "AI Voice Agents", "AI Agents (Claude CLI)", "OpenClaw", "Image-to-Video"],
    accent: {
      hex: "#c084fc",
      glow: "rgba(192,132,252,0.45)",
      badgeGlow: "rgba(192,132,252,0.25)",
      icon: "text-purple-300 group-hover:text-purple-200",
      ring: "group-hover:ring-purple-400/50",
    },
  },
  {
    icon: Palette,
    title: "Design & Content",
    tags: ["Graphic Design", "Logo / Banner", "Canva", "Photoshop", "Video Editing"],
    accent: {
      hex: "#e879f9",
      glow: "rgba(217,70,239,0.45)",
      badgeGlow: "rgba(232,121,249,0.22)",
      icon: "text-fuchsia-300 group-hover:text-fuchsia-200",
      ring: "group-hover:ring-fuchsia-400/50",
    },
  },
  {
    icon: Users,
    title: "Other",
    tags: ["Inventory Handling", "Customer Service", "Sales"],
    accent: {
      hex: "#38bdf8",
      glow: "rgba(56,189,248,0.45)",
      badgeGlow: "rgba(56,189,248,0.22)",
      icon: "text-sky-300 group-hover:text-sky-200",
      ring: "group-hover:ring-sky-400/50",
    },
  },
];

/* One skill tile — same layered glass + 3D tilt language as the original
   feature cards, with each category's skills rendered as a tag list. */
function SkillCard({ skill }: { skill: (typeof SKILLS)[number] }) {
  const Icon = skill.icon;
  const reduce = useReducedMotion();
  const hoverCapable = useIsHoverCapable();
  const tiltEnabled = hoverCapable && !reduce;

  const { ref, hovered, rotateX, rotateY, onMouseMove, onMouseEnter, onMouseLeave } =
    useTilt(tiltEnabled, 10);

  return (
    <motion.div
      ref={ref}
      variants={reduce ? fadeOnlyVariants : cardVariants}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={reduce ? undefined : { y: -4 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="group relative h-full will-change-transform"
    >
      <GlassCard
        accent={skill.accent}
        hovered={hovered}
        icon={<Icon className="h-7 w-7" />}
        iconClassName={`${skill.accent.icon} ${skill.accent.ring}`}
        title={skill.title}
      >
        <ul className="mt-5 flex flex-wrap gap-2">
          {skill.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 transition-colors duration-300 group-hover:border-white/20"
            >
              {tag}
            </li>
          ))}
        </ul>
      </GlassCard>
    </motion.div>
  );
}

function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  /* Content and the heading glow drift at different speeds for layered depth */
  const contentY = useSectionParallax(sectionRef, [40, -40]);
  const orbY = useSectionParallax(sectionRef, [-20, 20]);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative overflow-hidden py-24 sm:py-32"
    >
      {/* Background video — full-bleed on md+, a fixed-height full-width stage
          on mobile so the whole 10s scene stays in frame instead of being
          cropped to a thin strip by object-cover on a tall portrait section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] md:inset-0 md:h-full"
      >
        <BackgroundVideo
          src="/videos/robot-working-1.mp4"
          poster="/videos/robot-working-1-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover object-[50%_45%]"
        />
        {/* Mobile-only bottom fade — blends the video stage into the dark
            section below (no hard cut at the 55vh boundary) */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent md:hidden" />
      </div>

      {/* Dark overlay — video stays visible but text/cards stay readable */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55"
      />

      {/* Edge fades — blend the video seamlessly into the section above
          and the projects section below (no harsh cut lines) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent"
      />

      <SectionGlow y={orbY} variant="indigo" />

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8"
      >
        <SectionHeading
          eyebrow="Skills"
          eyebrowClassName="text-indigo-400"
          title="What I Bring to the Table"
          subtext="A practical toolkit spanning engineering, applied AI, design, and real-world operations."
          className="mx-auto max-w-2xl text-center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SKILLS.map((skill) => (
            <SkillCard key={skill.title} skill={skill} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Projects                                                           */
/* ---------------------------------------------------------------- */
const PROJECTS = [
  {
    title: "Ecommerce Website with RAG Chatbot",
    icon: <Sparkles className="h-6 w-6" />,
    description:
      "Full-stack ecommerce site built with Next.js, Tailwind, Python, and Neon PostgreSQL — integrated with a real-time RAG-based AI chatbot.",
    theme: {
      primary: "#8b5cf6",
      secondary: "#ec4899",
      glow: "#c026d3",
    },
  },
  {
    title: "AI Voice Agent Development",
    icon: <Bot className="h-6 w-6" />,
    description:
      "Designed and developed AI voice agents for natural, real-time voice conversations with users.",
    theme: {
      primary: "#2dd4bf",
      secondary: "#10b981",
      glow: "#34d399",
    },
  },
  {
    title: "AI Agents on OpenClaw (Claude CLI)",
    icon: <Wrench className="h-6 w-6" />,
    description:
      "Building and deploying autonomous AI agents on OpenClaw with Claude CLI for automation and workflow tasks.",
    theme: {
      primary: "#38bdf8",
      secondary: "#818cf8",
      glow: "#60a5fa",
    },
  },
];

/* One project card — same tilt + glass language as the skill cards, reading
   its accent from the two-color `theme` object and keeping a "View Details"
   arrow that slides on hover. */
function ProjectCard({ project }: { project: (typeof PROJECTS)[number] }) {
  const reduce = useReducedMotion();
  const hoverCapable = useIsHoverCapable();
  const tiltEnabled = hoverCapable && !reduce;

  const { ref, hovered, rotateX, rotateY, onMouseMove, onMouseEnter, onMouseLeave } =
    useTilt(tiltEnabled, 8);

  const accent: GlassAccent = {
    hex: project.theme.primary,
    glow: project.theme.glow,
    /* Hex + alpha suffix → rgba, works in every modern browser */
    badgeGlow: `${project.theme.glow}45`,
    tint2: project.theme.secondary,
  };

  return (
    <motion.div
      ref={ref}
      variants={reduce ? fadeOnlyVariants : cardVariants}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={reduce ? undefined : { y: -4 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="group relative h-full will-change-transform"
    >
      <GlassCard accent={accent} hovered={hovered} icon={project.icon} title={project.title} description={project.description}>
        <a
          href="#contact"
          className="group/link mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
        >
          View Details
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
        </a>
      </GlassCard>
    </motion.div>
  );
}

function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentY = useSectionParallax(sectionRef, [40, -40]);
  const orbY = useSectionParallax(sectionRef, [-20, 20]);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative overflow-hidden py-24 sm:py-32"
    >
      {/* Background video — full-bleed on md+, a fixed-height full-width stage
          on mobile so the whole 10s scene stays in frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] md:inset-0 md:h-full"
      >
        <BackgroundVideo
          src="/videos/robot-presenting.mp4"
          poster="/videos/robot-presenting-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover object-[50%_45%]"
        />
        {/* Mobile-only bottom fade — blends the video stage into the dark
            section below (no hard cut at the 55vh boundary) */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent md:hidden" />
      </div>

      {/* Dark overlay — same density as Skills so the two sections read as
          one continuous rhythm (no jarring brightness jump) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55"
      />

      {/* Edge fades — blend into Skills above and Experience below */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent"
      />

      <SectionGlow y={orbY} variant="fuchsia" />

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8"
      >
        <SectionHeading
          eyebrow="Projects"
          eyebrowClassName="text-fuchsia-400"
          title="Things I've Built"
          subtext="Selected projects where engineering and applied AI meet real-world problems."
          className="mx-auto max-w-2xl text-center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PROJECTS.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Experience                                                         */
/* ---------------------------------------------------------------- */
const EXPERIENCES = [
  {
    role: "Graphic Services Rep",
    company: "Call Center",
    duration: "6 months",
    description:
      "Delivered logo, banner, thumbnail, NFT, and 2D/3D animation services via Twitter — handling client communication from brief to final delivery.",
    accent: { hex: "#8b5cf6", glow: "rgba(139,92,246,0.5)" },
    dot: "bg-indigo-500",
    ring: "ring-indigo-400/50",
  },
  {
    role: "Inventory Manager",
    company: "Kashie's Boutique Factory",
    duration: "4 months",
    description:
      "Monitored stock levels, produced inventory reports, and coordinated production to keep the factory floor running smoothly.",
    accent: { hex: "#22d3ee", glow: "rgba(34,211,238,0.45)" },
    dot: "bg-cyan-400",
    ring: "ring-cyan-400/50",
  },
  {
    role: "Call Agent",
    company: "GFS Builders",
    duration: "5 months",
    description:
      "Handled property-related calls, managed client data, and generated leads for a real-estate development firm.",
    accent: { hex: "#e879f9", glow: "rgba(232,121,249,0.45)" },
    dot: "bg-fuchsia-400",
    ring: "ring-fuchsia-400/50",
  },
];

/* One timeline row — alternating on desktop (odd rows right, even rows left),
   stacked on mobile, with a glowing dot on the central connecting line. */
function ExperienceRow({
  exp,
  index,
}: {
  exp: (typeof EXPERIENCES)[number];
  index: number;
}) {
  const reduce = useReducedMotion();
  const left = index % 2 === 0;
  const marker = (
    <div
      aria-hidden
      className="absolute left-[19px] top-1 h-3 w-3 rounded-full md:left-1/2 md:-translate-x-1/2"
    >
      <div
        className={`h-3 w-3 rounded-full ${exp.dot} shadow-[0_0_14px_rgba(139,92,246,0.7)]`}
      />
      <div
        className={`absolute -inset-1.5 rounded-full ${exp.ring} ring-2 opacity-40`}
      />
    </div>
  );

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: easeOutExpo }}
      className="relative pl-14 md:grid md:grid-cols-2 md:gap-12 md:pl-0"
    >
      {marker}
      <div className={left ? "md:col-start-1" : "md:col-start-2"}>
        <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-7 backdrop-blur-xl transition-all duration-300 hover:border-white/25">
          {/* Top inner glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-5 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${exp.accent.hex}66, transparent)`,
            }}
          />
          <div
            aria-hidden
            className="noise-overlay pointer-events-none absolute inset-0"
          />
          <div className="relative flex items-center gap-3">
            <div
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10"
              style={{ color: exp.accent.hex }}
            >
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">
                {exp.role}
              </h3>
              <p className="text-sm text-slate-400">{exp.company}</p>
            </div>
          </div>
          <div
            className="relative mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              color: exp.accent.hex,
              background: `${exp.accent.hex}1a`,
              border: `1px solid ${exp.accent.hex}40`,
            }}
          >
            <Calendar className="h-3.5 w-3.5" />
            {exp.duration}
          </div>
          <p className="relative mt-4 text-sm leading-relaxed text-slate-300">
            {exp.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentY = useSectionParallax(sectionRef, [40, -40]);
  const orbY = useSectionParallax(sectionRef, [-20, 20]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative overflow-hidden bg-background py-24 sm:py-32"
    >
      <SectionGlow y={orbY} variant="violet" />
      <div aria-hidden className="section-mesh pointer-events-none absolute inset-0" />

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8"
      >
        <SectionHeading
          eyebrow="Experience"
          eyebrowClassName="text-violet-400"
          title="Where I've Worked"
          subtext="Hands-on roles across service, operations, and sales that shaped how I ship."
          className="mx-auto max-w-2xl text-center"
        />

        <div className="relative mt-16">
          {/* Connecting vertical line */}
          <div
            aria-hidden
            className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/60 via-fuchsia-500/40 to-transparent md:left-1/2 md:-translate-x-1/2"
          />
          <div className="space-y-12 md:space-y-16">
            {EXPERIENCES.map((exp, i) => (
              <ExperienceRow key={exp.role} exp={exp} index={i} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Education                                                          */
/* ---------------------------------------------------------------- */
const EDUCATION = [
  {
    degree: "Intermediate",
    school: "AndaMore Digree College, Karachi",
    year: "2023",
    note: "75% in 2nd Year Examination",
    accent: {
      hex: "#a78bfa",
      glow: "rgba(167,139,250,0.45)",
      badgeGlow: "rgba(167,139,250,0.28)",
      avatar: "from-violet-500 to-fuchsia-500",
    },
  },
  {
    degree: "Matriculation",
    school: "The Mount View School, Karachi",
    year: "2020",
    note: "Completed secondary education",
    accent: {
      hex: "#818cf8",
      glow: "rgba(129,140,248,0.45)",
      badgeGlow: "rgba(129,140,248,0.28)",
      avatar: "from-indigo-500 to-violet-500",
    },
  },
];

/* One education card — same layered glass + gradient border language as the
   old testimonial cards, but with a graduation-cap icon standing in for
   stars, and the credential meta where the author line used to be. */
function EducationCard({ edu }: { edu: (typeof EDUCATION)[number] }) {
  const reduce = useReducedMotion();
  const hoverCapable = useIsHoverCapable();
  const tiltEnabled = hoverCapable && !reduce;

  const { ref, hovered, rotateX, rotateY, onMouseMove, onMouseEnter, onMouseLeave } =
    useTilt(tiltEnabled, 4);

  const borderGradient = hovered
    ? `linear-gradient(180deg, ${edu.accent.hex}cc, ${edu.accent.hex}33 45%, transparent 72%)`
    : `linear-gradient(180deg, ${edu.accent.hex}52, rgba(255,255,255,0.06) 42%, transparent 75%)`;

  const cardShadow = hovered
    ? `0 1px 2px rgba(0,0,0,0.6), 0 12px 32px -12px rgba(0,0,0,0.7), 0 0 56px -10px ${edu.accent.glow}`
    : `0 1px 2px rgba(0,0,0,0.5), 0 6px 20px -12px rgba(0,0,0,0.6), 0 0 34px -18px ${edu.accent.glow}`;

  return (
    <motion.div
      ref={ref}
      variants={reduce ? fadeOnlyVariants : cardVariants}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={reduce ? undefined : { y: -4 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="group relative h-full will-change-transform"
    >
      <div
        className="relative h-full rounded-3xl p-px transition-shadow duration-300"
        style={{ background: borderGradient, boxShadow: cardShadow }}
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)_45%,rgba(255,255,255,0))] p-8">
          {/* Top inner glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-4 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${edu.accent.hex}59, transparent)`,
            }}
          />
          {/* Grain / noise overlay */}
          <div aria-hidden className="noise-overlay pointer-events-none absolute inset-0" />

          {/* Graduation cap badge with a low-opacity glow */}
          <div className="relative mb-6 inline-flex h-11 w-11 items-center justify-center self-start">
            <div
              aria-hidden
              className="absolute -inset-2 rounded-full opacity-50 blur-md transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: edu.accent.badgeGlow }}
            />
            <div
              className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${edu.accent.avatar} text-white ring-1 ring-white/20`}
            >
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            {edu.degree}
          </h3>
          <p className="mt-1.5 text-sm text-slate-300">{edu.school}</p>

          <div className="mt-6 flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                color: edu.accent.hex,
                background: `${edu.accent.hex}1a`,
                border: `1px solid ${edu.accent.hex}40`,
              }}
            >
              <Calendar className="h-3.5 w-3.5" />
              {edu.year}
            </span>
            <span className="text-xs text-slate-500">{edu.note}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Education() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentY = useSectionParallax(sectionRef, [40, -40]);
  const orbY = useSectionParallax(sectionRef, [-20, 20]);

  return (
    <section
      id="education"
      ref={sectionRef}
      className="relative overflow-hidden bg-background py-24 sm:py-32"
    >
      <SectionGlow y={orbY} variant="violet" />
      <div aria-hidden className="section-mesh pointer-events-none absolute inset-0" />

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8"
      >
        <SectionHeading
          eyebrow="Education"
          eyebrowClassName="text-violet-400"
          title="Education"
          subtext="The academic foundation behind the build."
          className="mx-auto max-w-2xl text-center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-16 grid gap-6 md:grid-cols-2"
        >
          {EDUCATION.map((edu) => (
            <EducationCard key={edu.degree} edu={edu} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Contact                                                            */
/* ---------------------------------------------------------------- */
const CONTACT_INFO = [
  { label: "Email", value: "shahzad14580@gmail.com", href: "mailto:shahzad14580@gmail.com", icon: <Mail className="h-5 w-5" /> },
  { label: "Phone", value: "03272578101", href: "tel:+923272578101", icon: <Phone className="h-5 w-5" /> },
  { label: "Location", value: "Karachi, Pakistan", href: undefined, icon: <MapPin className="h-5 w-5" /> },
];

/* Social links — placeholder URLs for now, wired into the site later. */
const SOCIAL_PLACEHOLDERS = [
  { label: "GitHub", href: "https://github.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Twitter / X", href: "https://x.com" },
];

/* Inline brand SVGs (lucide-react doesn't ship Github/Linkedin/Twitter). */
const SOCIAL_ICONS = {
  GitHub: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.27 5.68.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  ),
  "Twitter / X": (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.63 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
    </svg>
  ),
};

function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });

      if (!res.ok) {
        let detail = "Something went wrong. Please try again.";
        try {
          const body = await res.json();
          if (body?.detail) detail = String(body.detail);
        } catch {
          /* ignore parse failure — keep the fallback message */
        }
        throw new Error(detail);
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-surface relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] p-8"
    >
      {/* Top edge highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
        }}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Name
          </span>
          <input
            type="text"
            name="name"
            required
            disabled={status === "loading"}
            placeholder="Your name"
            className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20 disabled:opacity-60"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            disabled={status === "loading"}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20 disabled:opacity-60"
          />
        </label>
      </div>
      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-medium text-slate-300">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={5}
          disabled={status === "loading"}
          placeholder="Tell me about your project…"
          className="w-full resize-none rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20 disabled:opacity-60"
        />
      </label>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "loading"}
          className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Send Message"}
          {status !== "loading" && (
            <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </button>

        {status === "success" && (
          <p className="text-sm font-medium text-emerald-300">
            Thanks — your message is on its way!
          </p>
        )}
        {status === "error" && (
          <p className="text-sm font-medium text-rose-300">{error}</p>
        )}
      </div>
    </form>
  );
}

function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentY = useSectionParallax(sectionRef, [40, -40]);
  const orbY = useSectionParallax(sectionRef, [-20, 20]);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-white/10 py-24 sm:py-32"
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-[100px]" />
      <SectionGlow y={orbY} variant="indigo" />

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8"
      >
        <SectionHeading
          eyebrow="Contact"
          eyebrowClassName="text-indigo-400"
          title="Let's Build Something Together"
          subtext="Have a project in mind, or just want to talk AI, automation, or the web? My inbox is open."
          className="mx-auto max-w-2xl text-center"
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-5">
          {/* Contact details */}
          <Reveal className="lg:col-span-2">
            <div className="space-y-4">
              {CONTACT_INFO.map((item) => {
                const inner = (
                  <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors duration-300 hover:border-white/25">
                    <div className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-indigo-300">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                        {item.label}
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-white">
                        {item.value}
                      </div>
                    </div>
                  </div>
                );
                return item.href ? (
                  <a key={item.label} href={item.href} className="block">
                    {inner}
                  </a>
                ) : (
                  <div key={item.label}>{inner}</div>
                );
              })}
            </div>

            {/* Social placeholder buttons */}
            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Find me online
              </p>
              <div className="mt-4 flex items-center gap-3">
                {SOCIAL_PLACEHOLDERS.map((s) => {
                  const Icon = SOCIAL_ICONS[s.label as keyof typeof SOCIAL_ICONS];
                  return (
                    <motion.a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      whileHover={{ y: -3 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-colors hover:border-white/30 hover:text-white"
                    >
                      {Icon}
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Contact form — POSTs to the FastAPI backend */}
          <Reveal delay={0.1} className="lg:col-span-3">
            <ContactForm />
          </Reveal>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Footer                                                             */
/* ---------------------------------------------------------------- */
const FOOTER_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

function Footer() {
  const reduce = useReducedMotion();
  const itemVariants = reduce ? fadeOnlyVariants : fadeUpBlur;
  const containerVariants = reduce ? undefined : staggerContainer;

  return (
    <footer className="relative overflow-hidden border-t-0">
      {/* Gradient glow line separating the footer from content above */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(139,92,246,0.6),rgba(56,189,248,0.4),rgba(139,92,246,0.6),transparent)]"
      />
      {/* Subtle radial accent glow behind footer content */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[36vmin] w-[64vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[80px]"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, rgba(139,92,246,0.14), rgba(56,189,248,0.07) 45%, transparent 70%)",
          }}
        />
        {/* Faint mesh for continuity */}
        <div className="section-mesh absolute inset-0" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row lg:px-8"
      >
        {/* Brand mark — subtle glow on hover, same gradient as navbar logo */}
        <motion.a
          variants={itemVariants}
          href="#hero"
          className="group flex items-center gap-2 text-white"
        >
          <motion.span
            whileHover={reduce ? undefined : { scale: 1.06, rotate: -3 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-black text-white shadow-[0_0_0_rgba(139,92,246,0)] transition-shadow duration-300 group-hover:shadow-[0_0_22px_rgba(139,92,246,0.55)]"
          >
            MS
          </motion.span>
          <span className="text-sm font-bold tracking-tight">Malik Shahzad</span>
        </motion.a>

        <motion.p
          variants={itemVariants}
          className="text-xs text-slate-500"
        >
          © 2026 Malik Shahzad. All rights reserved.
        </motion.p>

        <motion.nav variants={itemVariants} aria-label="Footer" className="flex items-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs text-slate-400 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </motion.nav>
      </motion.div>
    </footer>
  );
}

/* ---------------------------------------------------------------- */
/*  MarqueeSection — infinite auto-scrolling divider (right→left)     */
/*  between About and Skills. Rendered twice back-to-back for a       */
/*  seamless loop; CSS animation for compositor-thread performance.   */
/* ---------------------------------------------------------------- */
const MARQUEE_ITEMS = [
  { label: "Full-Stack Development", icon: Code2 },
  { label: "RAG Chatbot Development", icon: Bot },
  { label: "AI Voice Agents", icon: Mic },
  { label: "AI Agent Automation (Claude CLI / OpenClaw)", icon: Cpu },
  { label: "Next.js & Tailwind CSS", icon: Layers },
  { label: "Python & Neon PostgreSQL", icon: Database },
  { label: "YouTube Content Creation", icon: PlayCircle },
  { label: "Amazon KDP Publishing", icon: BookOpen },
  { label: "Canva & Video Editing", icon: PenTool },
  { label: "UI/UX Animation", icon: Wand2 },
];

function MarqueeContent({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-8 pr-8"
      aria-hidden={hidden || undefined}
    >
      {MARQUEE_ITEMS.map(({ label, icon: Icon }, i) => (
        <div key={i} className="flex shrink-0 items-center gap-8">
          {/* Icon in a small rounded badge with accent glow */}
          <div className="flex shrink-0 items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 shadow-[0_0_12px_rgba(139,92,246,0.25)]">
              <Icon className="h-[18px] w-[18px] text-indigo-300" aria-hidden="true" />
            </span>
            <span className="marquee-text text-lg font-semibold tracking-tight sm:text-xl">
              {label}
            </span>
          </div>
          {/* Small separator dot between pairs */}
          <span className="h-1 w-1 shrink-0 rounded-full bg-slate-600/60" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

function MarqueeSection() {
  return (
    <section
      aria-label="Skills and services marquee"
      className="relative w-full overflow-hidden border-y border-white/10 bg-black/30 py-6"
    >
      {/* Edge fade masks — text fades in/out instead of cutting off */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 sm:w-32 [mask-image:linear-gradient(to_right,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 sm:w-32 [mask-image:linear-gradient(to_left,black,transparent)]"
      />

      {/* Marquee track — duplicated for a seamless -50% loop. Speed is driven
          by --marquee-duration (set on hover), never restarted. */}
      <div className="marquee-track flex w-max" style={{ ["--marquee-duration" as string]: "60s" }}>
        <MarqueeContent />
        <MarqueeContent hidden />
      </div>
    </section>
  );
}

export {
  Nav,
  About,
  MarqueeSection,
  Skills,
  Projects,
  Experience,
  Education,
  Contact,
  Footer,
};
