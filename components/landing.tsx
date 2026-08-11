"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Layers,
  Gauge,
  Wand2,
  Quote,
  Star,
  Wrench,
  Smartphone,
  CheckCircle,
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
  { label: "Features", href: "#features" },
  { label: "Showcase", href: "#showcase" },
  { label: "Testimonials", href: "#testimonials" },
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
            N
          </span>
          <span className="text-sm font-bold tracking-tight">Nexus Studio</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} label={link.label} href={link.href} />
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="hidden text-sm text-slate-300 transition-colors hover:text-white sm:inline"
          >
            Sign in
          </Link>
          <motion.a
            href="#contact"
            whileHover={reduceMotion ? undefined : { scale: 1.05 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            Get Started
          </motion.a>
        </div>
      </nav>
    </motion.header>
  );
}

/* ---------------------------------------------------------------- */
/*  Features                                                           */
/* ---------------------------------------------------------------- */
const FEATURES = [
  {
    icon: Zap,
    title: "Blazing Fast",
    text: "Built on modern web standards with edge rendering and instant feedback for a snappy, responsive feel.",
    accent: {
      hex: "#fbbf24",
      glow: "rgba(251,191,36,0.45)",
      badgeGlow: "rgba(251,191,36,0.22)",
      icon: "text-amber-300 group-hover:text-amber-200",
      bg: "from-amber-500/20 to-orange-500/20",
      ring: "group-hover:ring-amber-400/50",
    },
  },
  {
    icon: Shield,
    title: "Secure by Design",
    text: "Accessibility, sensible defaults, and hardened engineering so your product is trustworthy from day one.",
    accent: {
      hex: "#34d399",
      glow: "rgba(52,211,153,0.45)",
      badgeGlow: "rgba(52,211,153,0.22)",
      icon: "text-emerald-300 group-hover:text-emerald-200",
      bg: "from-emerald-500/20 to-teal-500/20",
      ring: "group-hover:ring-emerald-400/50",
    },
  },
  {
    icon: Layers,
    title: "Scalable Systems",
    text: "Component-driven architecture that grows with you — from a landing page to a full product suite.",
    accent: {
      hex: "#818cf8",
      glow: "rgba(129,140,248,0.5)",
      badgeGlow: "rgba(129,140,248,0.25)",
      icon: "text-indigo-300 group-hover:text-indigo-200",
      bg: "from-indigo-500/20 to-violet-500/20",
      ring: "group-hover:ring-indigo-400/50",
    },
  },
  {
    icon: Gauge,
    title: "Performance First",
    text: "Core Web Vitals in the green, tiny bundles, and no jank — because every millisecond matters.",
    accent: {
      hex: "#38bdf8",
      glow: "rgba(56,189,248,0.45)",
      badgeGlow: "rgba(56,189,248,0.22)",
      icon: "text-sky-300 group-hover:text-sky-200",
      bg: "from-sky-500/20 to-cyan-500/20",
      ring: "group-hover:ring-sky-400/50",
    },
  },
  {
    icon: Wand2,
    title: "Delightful Motion",
    text: "Intentional, spring-driven animations that guide the eye and make your product feel alive.",
    accent: {
      hex: "#e879f9",
      glow: "rgba(217,70,239,0.45)",
      badgeGlow: "rgba(232,121,249,0.22)",
      icon: "text-fuchsia-300 group-hover:text-fuchsia-200",
      bg: "from-fuchsia-500/20 to-purple-500/20",
      ring: "group-hover:ring-fuchsia-400/50",
    },
  },
  {
    icon: Sparkles,
    title: "AI-Powered Workflow",
    text: "Generative tooling and smart automation that collapse weeks of design work into hours.",
    accent: {
      hex: "#c084fc",
      glow: "rgba(192,132,252,0.45)",
      badgeGlow: "rgba(192,132,252,0.25)",
      icon: "text-purple-300 group-hover:text-purple-200",
      bg: "from-purple-500/20 to-pink-500/20",
      ring: "group-hover:ring-purple-400/50",
    },
  },
];

/* One feature tile: layered premium surface (gradient border, grain, top
   highlight, multi-layer shadows) + the existing 3D tilt / lift / springy
   icon. All effects are transform/opacity/box-shadow only — GPU friendly. */
function FeatureCard({ feature }: { feature: (typeof FEATURES)[number] }) {
  const Icon = feature.icon;
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
        accent={feature.accent}
        hovered={hovered}
        icon={<Icon className="h-7 w-7" />}
        iconClassName={`${feature.accent.icon} ${feature.accent.ring}`}
        title={feature.title}
        description={feature.text}
      />
    </motion.div>
  );
}

function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  /* Content and the heading glow drift at different speeds for layered depth */
  const contentY = useSectionParallax(sectionRef, [40, -40]);
  const orbY = useSectionParallax(sectionRef, [-20, 20]);

  return (
    <section
      id="features"
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

      {/* Edge fades — blend the video seamlessly into the robot-hero section
          above and the showcase section below (no harsh cut lines) */}
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
          eyebrow="Features"
          eyebrowClassName="text-indigo-400"
          title="Everything you need to ship"
          subtext="A complete toolkit designed to take your product from idea to launch — without the usual friction."
          className="mx-auto max-w-2xl text-center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Showcase                                                           */
/* ---------------------------------------------------------------- */
const SHOWCASE_ITEMS = [
  {
    title: "Elegant Design",
    icon: <Star className="h-6 w-6" />,
    description:
      "Thoughtful typography, spacing, and color systems that make every interface feel intentional and refined.",
    theme: {
      primary: "#8b5cf6",
      secondary: "#ec4899",
      glow: "#c026d3",
    },
  },
  {
    title: "High Performance",
    icon: <Zap className="h-6 w-6" />,
    description:
      "Core Web Vitals in the green, tiny bundles, and zero jank — every millisecond counts on modern web.",
    theme: {
      primary: "#2dd4bf",
      secondary: "#10b981",
      glow: "#34d399",
    },
  },
  {
    title: "Easy Integration",
    icon: <Wrench className="h-6 w-6" />,
    description:
      "Drop-in components and clean APIs that plug straight into your stack without fighting your tooling.",
    theme: {
      primary: "#f97316",
      secondary: "#ef4444",
      glow: "#fb923c",
    },
  },
  {
    title: "Customizable",
    icon: <Star className="h-6 w-6" />,
    description:
      "Design tokens and variants that adapt to your brand — change colors, themes, and motion in minutes.",
    theme: {
      primary: "#facc15",
      secondary: "#a16207",
      glow: "#eab308",
    },
  },
  {
    title: "Responsive",
    icon: <Smartphone className="h-6 w-6" />,
    description:
      "Fluid layouts and adaptive components that look flawless on every screen, from mobile to ultrawide.",
    theme: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      glow: "#818cf8",
    },
  },
  {
    title: "Modern Tech",
    icon: <CheckCircle className="h-6 w-6" />,
    description:
      "Built on the latest standards — edge rendering, AI tooling, and a component architecture built to scale.",
    theme: {
      primary: "#dc2626",
      secondary: "#7f1d1d",
      glow: "#f87171",
    },
  },
];

/* One showcase card — same tilt + glass language as the Feature cards, but
   reading its accent from the two-color `theme` object and keeping the
   "Learn more →" arrow that slides on hover. */
function ShowcaseCard({ item }: { item: (typeof SHOWCASE_ITEMS)[number] }) {
  const reduce = useReducedMotion();
  const hoverCapable = useIsHoverCapable();
  const tiltEnabled = hoverCapable && !reduce;

  const { ref, hovered, rotateX, rotateY, onMouseMove, onMouseEnter, onMouseLeave } =
    useTilt(tiltEnabled, 8);

  const accent: GlassAccent = {
    hex: item.theme.primary,
    glow: item.theme.glow,
    /* Hex + alpha suffix → rgba, works in every modern browser */
    badgeGlow: `${item.theme.glow}45`,
    tint2: item.theme.secondary,
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
      <GlassCard accent={accent} hovered={hovered} icon={item.icon} title={item.title} description={item.description}>
        <a
          href="#contact"
          className="group/link mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
        >
          Learn more
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
        </a>
      </GlassCard>
    </motion.div>
  );
}

function Showcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentY = useSectionParallax(sectionRef, [40, -40]);
  const orbY = useSectionParallax(sectionRef, [-20, 20]);

  return (
    <section
      id="showcase"
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

      {/* Dark overlay — same density as Features so the two sections read as
          one continuous rhythm (no jarring brightness jump) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55"
      />

      {/* Edge fades — blend into Features above and Testimonials below */}
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
          eyebrow="Showcase"
          eyebrowClassName="text-fuchsia-400"
          title="Work that speaks for itself"
          subtext="A selection of interfaces and experiences crafted with the same care we bring to every project."
          className="mx-auto max-w-2xl text-center"
          action={
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition-colors hover:text-indigo-200"
            >
              Start your project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          }
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SHOWCASE_ITEMS.map((item) => (
            <ShowcaseCard key={item.title} item={item} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Testimonials                                                       */
/* ---------------------------------------------------------------- */
const TESTIMONIALS = [
  {
    quote:
      "The most polished launch we've ever had. The motion and attention to detail convinced our investors instantly.",
    name: "Sarah Chen",
    role: "CEO, Lumen Labs",
    accent: {
      hex: "#a78bfa",
      glow: "rgba(167,139,250,0.45)",
      badgeGlow: "rgba(167,139,250,0.28)",
      avatar: "from-violet-500 to-fuchsia-500",
    },
  },
  {
    quote:
      "From Figma to production in days. The performance is unreal and our conversion rate jumped 40%.",
    name: "Marcus Reid",
    role: "Founder, Northwind",
    accent: {
      hex: "#818cf8",
      glow: "rgba(129,140,248,0.45)",
      badgeGlow: "rgba(129,140,248,0.28)",
      avatar: "from-indigo-500 to-violet-500",
    },
  },
  {
    quote:
      "Working with this team felt like having a design department on demand. Every detail just works.",
    name: "Priya Sharma",
    role: "Product Lead, Halcyon",
    accent: {
      hex: "#c084fc",
      glow: "rgba(192,132,252,0.45)",
      badgeGlow: "rgba(192,132,252,0.28)",
      avatar: "from-purple-500 to-pink-500",
    },
  },
];

/* One testimonial card: layered surface + gradient border + multi-layer
   purple-tinted shadows (same language as Features), a light 4° tilt, and
   stars that pop in one-by-one when the card enters view. Content-focused,
   so the tilt is intentionally subtler than the feature tiles. */
function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  const reduce = useReducedMotion();
  const hoverCapable = useIsHoverCapable();
  const tiltEnabled = hoverCapable && !reduce;

  const { ref, hovered, rotateX, rotateY, onMouseMove, onMouseEnter, onMouseLeave } =
    useTilt(tiltEnabled, 4);

  const borderGradient = hovered
    ? `linear-gradient(180deg, ${t.accent.hex}cc, ${t.accent.hex}33 45%, transparent 72%)`
    : `linear-gradient(180deg, ${t.accent.hex}52, rgba(255,255,255,0.06) 42%, transparent 75%)`;

  const cardShadow = hovered
    ? `0 1px 2px rgba(0,0,0,0.6), 0 12px 32px -12px rgba(0,0,0,0.7), 0 0 56px -10px ${t.accent.glow}`
    : `0 1px 2px rgba(0,0,0,0.5), 0 6px 20px -12px rgba(0,0,0,0.6), 0 0 34px -18px ${t.accent.glow}`;

  return (
    <motion.figure
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
              background: `linear-gradient(90deg, transparent, ${t.accent.hex}59, transparent)`,
            }}
          />
          {/* Grain / noise overlay */}
          <div aria-hidden className="noise-overlay pointer-events-none absolute inset-0" />

          {/* Stars — pop in one-by-one when the card enters view */}
          <motion.div
            variants={reduce ? undefined : {
              hidden: {},
              visible: { transition: { staggerChildren: 0.05, delayChildren: 0.25 } },
            }}
            initial={reduce ? false : "hidden"}
            whileInView={reduce ? undefined : "visible"}
            viewport={{ once: true }}
            className="relative mb-5 flex gap-1 text-amber-400"
          >
            {Array.from({ length: 5 }).map((_, s) => (
              <motion.span
                key={s}
                variants={
                  reduce
                    ? undefined
                    : {
                        hidden: { opacity: 0, scale: 0 },
                        visible: {
                          opacity: 1,
                          scale: 1,
                          transition: { type: "spring", stiffness: 360, damping: 18 },
                        },
                      }
                }
              >
                <Star className="h-4 w-4 fill-current" />
              </motion.span>
            ))}
          </motion.div>

          {/* Quote in a subtle circular badge with a low-opacity glow */}
          <div className="relative mb-5 inline-flex h-9 w-9 items-center justify-center self-start">
            <div
              aria-hidden
              className="absolute -inset-2 rounded-full opacity-50 blur-md transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: t.accent.badgeGlow }}
            />
            <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-indigo-300 ring-1 ring-white/10">
              <Quote className="h-4 w-4" />
            </div>
          </div>

          <blockquote className="relative flex-1 text-sm leading-relaxed text-slate-300">
            "{t.quote}"
          </blockquote>

          <figcaption className="relative mt-7 flex items-center gap-3">
            {/* Avatar with a soft accent glow ring + subtle scale on hover */}
            <div className="relative h-11 w-11">
              <div
                aria-hidden
                className="absolute -inset-1.5 rounded-full opacity-50 blur-md transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: t.accent.badgeGlow }}
              />
              <motion.div
                animate={!reduce ? { scale: hovered ? 1.06 : 1 } : undefined}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${t.accent.avatar} text-sm font-bold text-white ring-2 ring-white/10`}
              >
                {t.name.charAt(0)}
              </motion.div>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{t.name}</div>
              <div className="text-xs text-slate-500">{t.role}</div>
            </div>
          </figcaption>
        </div>
      </div>
    </motion.figure>
  );
}

function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentY = useSectionParallax(sectionRef, [40, -40]);
  const orbY = useSectionParallax(sectionRef, [-20, 20]);

  return (
    <section
      id="testimonials"
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
          eyebrow="Testimonials"
          eyebrowClassName="text-violet-400"
          title="Trusted by ambitious teams"
          subtext="Real words from founders and product leaders who shipped with us."
          className="mx-auto max-w-2xl text-center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  CTA                                                                */
/* ---------------------------------------------------------------- */
function Cta() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-white/10 py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-[100px]" />
      <Reveal className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Ready to build something{" "}
          <span className="glitch-text">extraordinary</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-400 sm:text-lg">
          Let's bring your vision to life with a product your customers will
          love — and a demo your stakeholders will remember.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
          >
            Book a free consult
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/10"
          >
            See what's possible
          </a>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Footer                                                             */
/* ---------------------------------------------------------------- */
const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.27 5.68.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://x.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.63 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z" />
      </svg>
    ),
  },
  {
    label: "Dribbble",
    href: "https://dribbble.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0Zm7.94 5.53a10.2 10.2 0 0 1 2.3 6.35c-.34-.07-3.7-.75-7.08-.33-.08-.17-.15-.35-.23-.53-.21-.5-.44-1-.68-1.49 3.75-1.53 5.45-3.72 5.69-4ZM12 1.77c2.6 0 4.98.97 6.79 2.57-.2.34-1.72 2.4-5.31 3.78a53.6 53.6 0 0 0-3.78-5.87c.74-.3 1.52-.48 2.3-.48ZM7.5 2.75a60.8 60.8 0 0 1 3.74 5.79 40.7 40.7 0 0 1-9.36 1.24c.9-3.22 3.06-5.85 5.62-7.03ZM1.76 12v-.3c.4 0 4.9.06 9.95-1.38.28.55.55 1.1.79 1.66-.08.02-.17.05-.25.07-5.27 1.83-8.05 6.82-8.38 7.47A10.2 10.2 0 0 1 1.76 12Zm10.24 10.23a10.22 10.22 0 0 1-6.32-2.2c.26-.66 2.38-5.29 8.1-7.44l.07-.02a43.4 43.4 0 0 1 2.23 7.94 10.14 10.14 0 0 1-4.08 1.72Zm5.86-2.4a44.3 44.3 0 0 0-2.05-7.41c3.2-.51 6.01.32 6.36.44a10.3 10.3 0 0 1-4.31 6.97Z" />
      </svg>
    ),
  },
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
            N
          </motion.span>
          <span className="text-sm font-bold tracking-tight">Nexus Studio</span>
        </motion.a>

        <motion.p
          variants={itemVariants}
          className="text-xs text-slate-500"
        >
          © {new Date().getFullYear()} Nexus Studio. Crafted for the modern web.
        </motion.p>

        <motion.div variants={itemVariants} className="flex items-center gap-4">
          {SOCIALS.map((s) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-colors hover:border-white/30 hover:text-white"
            >
              {s.icon}
            </motion.a>
          ))}
        </motion.div>
      </motion.div>
    </footer>
  );
}

export { Nav, Features, Showcase, Testimonials, Cta, Footer };
