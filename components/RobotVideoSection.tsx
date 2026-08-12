"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/**
 * Full-bleed background video section that sits between the hero and the
 * features grid. The video is muted/looping/inline (autoplay-safe on every
 * browser) and only fetches its source once the section nears the viewport,
 * so it never competes with the hero's initial paint. The dark bottom
 * gradient keeps any text readable and blends the section's bottom edge
 * seamlessly into the near-black features section below.
 */
export function RobotVideoSection() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  // Lazy-load the video: set src only when the section is about to enter
  // the viewport (IntersectionObserver). The poster shows meanwhile.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      setVideoSrc("/videos/robot-hero.mp4");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVideoSrc("/videos/robot-hero.mp4");
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px 0px", threshold: 0 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="robot-video-section"
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-black lg:h-[120vh]"
      aria-label="Building the future with AI"
    >
      {/* Video background — full-bleed, no box, no radius, blends into black.
          object-position keeps the robot's head (top of frame) in view even
          on ultra-wide screens where cover crops the top/bottom. */}
      <video
        id="robot-video"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        poster="/videos/robot-hero-poster.jpg"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[50%_20%]"
      >
        {videoSrc && <source src={videoSrc} type="video/mp4" />}
      </video>

      {/* Dark overlay gradient: darkest at the bottom, so text stays readable */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"
        aria-hidden="true"
      />

      {/* Content — bottom-aligned over the darkest part of the gradient */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 lg:px-8 lg:pb-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: easeOutExpo }}
          className="max-w-2xl"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
            AI & Automation
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Building the <span className="glitch-text">future with AI</span>
          </h2>
          <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
            RAG chatbots, AI voice agents, and autonomous agents engineered to
            think, learn, and automate real work.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
