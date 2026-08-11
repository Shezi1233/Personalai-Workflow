"use client";

import { useEffect, useRef, useState } from "react";

type BackgroundVideoProps = {
  src: string;
  poster?: string;
  /** Extra classes for the video element (positioning / sizing). */
  className?: string;
  /** How early (px) the video should start loading before it enters view. */
  rootMargin?: string;
};

/**
 * Lazy background video that only fetches its source once the element nears
 * the viewport (IntersectionObserver). The video ref is given a direct `src`
 * plus explicit `load()` / `play()` — the common "inject a <source> child"
 * pattern silently fails to start on iOS Safari / mobile, especially when the
 * section is below the fold and the source arrives after mount. `aria-hidden`
 * + pointer-events-none keep it purely decorative.
 */
export function BackgroundVideo({
  src,
  poster,
  className,
  rootMargin = "200px 0px",
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  /* Load + play once we know the video is (about to be) visible. */
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !inView) return;

    el.src = src;
    el.load();
    const play = el.play();
    if (play !== undefined) play.catch(() => {});
  }, [inView, src]);

  /* Detect when the video element nears the viewport. */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
      disablePictureInPicture
      controlsList="nodownload noplaybackrate nofullscreen"
      className={className}
    />
  );
}
