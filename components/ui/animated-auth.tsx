"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Eye,
  EyeClosed,
  Lock,
  Mail,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  AnimatedAuth — login / signup with bag-icon reveal animation        */
/*                                                                      */
/*  Sequence (plays once on mount):                                     */
/*    1. Briefcase icon drops from the top, bounces to land centered.   */
/*    2. It pulses briefly (scale 1 → 1.1 → 1).                        */
/*    3. The form card pops out of the bag's position with spring       */
/*       physics (stiffness 260, damping 20) into its final spot.       */
/*    4. The bag shrinks and settles as a small accent icon at the top  */
/*       of the card (a little logo/mascot moment).                     */
/*    5. Form fields stagger fade-up after the card pops in.            */
/*  Switching login ⇄ signup crossfades the forms without replaying.    */
/* ------------------------------------------------------------------ */

type AuthMode = "login" | "signup";

const MODE_CONFIG: Record<
  AuthMode,
  {
    title: string;
    subtitle: string;
    submit: string;
    footer: { text: string; action: string; to: AuthMode };
  }
> = {
  login: {
    title: "Welcome Back",
    subtitle: "Sign in to continue to my portfolio",
    submit: "Sign In",
    footer: { text: "Don't have an account?", action: "Sign up", to: "signup" },
  },
  signup: {
    title: "Create Account",
    subtitle: "Join in under a minute",
    submit: "Create Account",
    footer: { text: "Already have an account?", action: "Log in", to: "login" },
  },
};

/* ------------------------------------------------------------------ */
/*  GlassField — input with leading icon + focus glow + subtle scale    */
/* ------------------------------------------------------------------ */
type GlassFieldProps = {
  icon: LucideIcon;
  trailing?: React.ReactNode;
} & React.ComponentProps<"input">;

function GlassField({ icon: Icon, trailing, className, ...props }: GlassFieldProps) {
  return (
    <div className="group relative transition-transform duration-300 focus-within:scale-[1.02]">
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-indigo-300"
        aria-hidden="true"
      />
      <input
        className={cn(
          "w-full rounded-xl border border-white/15 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300",
          "focus:border-indigo-400/70 focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-400/20 focus:placeholder:text-slate-600",
          trailing && "pr-10",
          className
        )}
        {...props}
      />
      {trailing ? (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PasswordToggle — a11y-friendly show/hide button                     */
/* ------------------------------------------------------------------ */
function PasswordToggle({
  shown,
  onToggle,
}: {
  shown: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? "Hide password" : "Show password"}
      aria-pressed={shown}
      className="cursor-pointer rounded text-slate-500 transition-colors duration-300 hover:text-white"
    >
      {shown ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  AuthBackground — deep navy, purple/blue orbs, grid + grain (hero)   */
/* ------------------------------------------------------------------ */
function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-black/[0.96] px-6 py-16">
      {/* Ambient background — matches the hero's layers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="hero-grid absolute inset-0" />
        {/* Breathing purple → blue orb (upper center, behind the bag drop) */}
        <div className="absolute left-1/2 top-[16%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2">
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, rgba(139,92,246,0.38), rgba(99,102,241,0.16) 45%, transparent 72%)",
              filter: "blur(46px)",
            }}
          />
        </div>
        {/* Cyan/blue orb, offset low-right */}
        <div className="absolute bottom-[12%] right-[8%] h-[40vmin] w-[40vmin]">
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                "radial-gradient(circle at 40% 40%, rgba(56,189,248,0.28), rgba(59,130,246,0.12) 45%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>
        <div className="hero-noise absolute inset-0" />
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AuthCard — glass panel in the site's glassmorphism language         */
/* ------------------------------------------------------------------ */
function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-surface relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] shadow-[0_24px_70px_-20px_rgba(0,0,0,0.85)]">
      {/* Faint accent tint — indigo + cyan radial spots under the content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 130% at 12% 8%, rgba(139,92,246,0.18) 0%, transparent 55%), radial-gradient(120% 130% at 92% 96%, rgba(56,189,248,0.12) 0%, transparent 55%)",
        }}
      />
      {/* Top edge highlight — light catching glass */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
        }}
      />
      {/* Grain / noise overlay */}
      <div aria-hidden className="noise-overlay pointer-events-none absolute inset-0" />

      <div className="relative p-8 sm:p-10">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FieldStagger — wraps a form's rows and staggers them fade-up        */
/* ------------------------------------------------------------------ */
function FieldStagger({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  const rows = Array.isArray(children) ? children : [children];
  return (
    <div className="space-y-4">
      {rows.map((row, i) => (
        <motion.div
          key={i}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.08 + i * 0.06, duration: 0.45, ease: "easeOut" }}
        >
          {row}
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PrimaryButton — white pill, same language as the hero CTAs          */
/* ------------------------------------------------------------------ */
function PrimaryButton({ label, isLoading }: { label: string; isLoading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/70 border-t-transparent" />
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  AuthForm — one login or signup form (crossfaded on mode toggle)     */
/* ------------------------------------------------------------------ */
type AuthFormProps = {
  mode: AuthMode;
  showPassword: boolean;
  showConfirm: boolean;
  name: string;
  email: string;
  password: string;
  confirm: string;
  rememberMe: boolean;
  error: string | null;
  shake: number;
  isLoading: boolean;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onConfirm: (v: string) => void;
  onRememberMe: (v: boolean) => void;
  onTogglePassword: () => void;
  onToggleConfirm: () => void;
  onSwitchMode: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

function AuthForm({
  mode,
  showPassword,
  showConfirm,
  name,
  email,
  password,
  confirm,
  rememberMe,
  error,
  shake,
  isLoading,
  onName,
  onEmail,
  onPassword,
  onConfirm,
  onRememberMe,
  onTogglePassword,
  onToggleConfirm,
  onSwitchMode,
  onSubmit,
}: AuthFormProps) {
  const config = MODE_CONFIG[mode];
  const isLogin = mode === "login";

  const rows = [
    mode === "signup" && (
      <GlassField
        key="name"
        icon={User}
        type="text"
        placeholder="Full name"
        value={name}
        onChange={(e) => onName(e.target.value)}
        autoComplete="name"
        required
      />
    ),
    <GlassField
      key="email"
      icon={Mail}
      type="email"
      placeholder="Email address"
      value={email}
      onChange={(e) => onEmail(e.target.value)}
      autoComplete="email"
      inputMode="email"
      required
    />,
    <GlassField
      key="password"
      icon={Lock}
      type={showPassword ? "text" : "password"}
      placeholder="Password"
      value={password}
      onChange={(e) => onPassword(e.target.value)}
      autoComplete={isLogin ? "current-password" : "new-password"}
      required
      trailing={
        <PasswordToggle
          shown={showPassword}
          onToggle={onTogglePassword}
        />
      }
    />,
    mode === "signup" && (
      <GlassField
        key="confirm"
        icon={Lock}
        type={showConfirm ? "text" : "password"}
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => onConfirm(e.target.value)}
        autoComplete="new-password"
        required
        trailing={
          <PasswordToggle
            shown={showConfirm}
            onToggle={onToggleConfirm}
          />
        }
      />
    ),
    isLogin && (
      <div key="login-extras" className="flex items-center justify-between pt-1">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400 transition-colors hover:text-slate-200">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-white/25 bg-white/5 accent-indigo-500"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="text-xs text-slate-400 transition-colors duration-200 hover:text-white"
        >
          Forgot password?
        </Link>
      </div>
    ),
    <div key="submit" className="pt-2">
      <PrimaryButton label={config.submit} isLoading={isLoading} />
    </div>,
    <p key="footer" className="text-center text-sm text-slate-400">
      {config.footer.text}{" "}
      <button
        type="button"
        onClick={onSwitchMode}
        className="font-semibold text-indigo-300 transition-colors duration-200 hover:text-white"
      >
        {config.footer.action}
      </button>
    </p>,
  ].filter(Boolean) as React.ReactNode[];

  return (
    <motion.form
      onSubmit={onSubmit}
      animate={shake ? { x: [0, -10, 10, -7, 7, -3, 3, 0] } : undefined}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className={cn(
        "transition-[box-shadow,border-color] duration-300",
        error && "rounded-3xl ring-1 ring-rose-500/60 shadow-[0_0_40px_-8px_rgba(244,63,94,0.5)]"
      )}
    >
      {error && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-center text-xs font-medium text-rose-300"
        >
          {error}
        </motion.p>
      )}
      <FieldStagger>{rows}</FieldStagger>
    </motion.form>
  );
}

/* ------------------------------------------------------------------ */
/*  AuthNav — fixed top bar: brand → home, plus a path to the other     */
/*  auth mode (Sign up on the login page, Log in on the signup page).   */
/* ------------------------------------------------------------------ */
function AuthNav({ mode, onSwitch }: { mode: AuthMode; onSwitch: () => void }) {
  const isLogin = mode === "login";
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-black text-white">
            MS
          </span>
          <span className="text-sm font-bold tracking-tight">Malik Shahzad</span>
        </Link>
        <button
          type="button"
          onClick={onSwitch}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </nav>
    </motion.header>
  );
}

/* ------------------------------------------------------------------ */
/*  AnimatedAuth — the page itself                                      */
/* ------------------------------------------------------------------ */
export function AnimatedAuth({ initialMode = "login" }: { initialMode?: AuthMode }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const config = MODE_CONFIG[mode];

  /* Whether the entrance sequence has run. Set true once the card pops in
     (after bag drop + pulse), so toggling modes never replays it. */
  const [entered, setEntered] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  /* Error / loading state — `shake` is a counter that re-triggers the
     shake animation by changing the key. */
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setShake(0);
  };

  const fail = (message: string) => {
    setError(message);
    setShake((n) => n + 1);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);

    /* Client-side checks before hitting the server. */
    if (mode === "signup") {
      if (password !== confirm) {
        fail("Passwords do not match.");
        return;
      }
    }

    setIsLoading(true);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const body = { email, password };
    if (mode === "signup") {
      (body as Record<string, string>).name = name;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : res.status === 401
              ? "Invalid email or password."
              : "Something went wrong. Please try again.";
        fail(detail);
        return;
      }

      /* Success — go home. (The JWT lives in the httpOnly cookie set by the
         proxy route, so the client never touches it.) */
      router.push("/");
    } catch {
      fail("Network error. Please check your connection and try again.");
    }
  };

  return (
    <>
      <AuthNav
        mode={mode}
        onSwitch={() => switchMode(mode === "login" ? "signup" : "login")}
      />
      <AuthBackground>
      {/* Stage 1 of the entrance — the bag drops from the top and lands
          centered, wobbles once, then sits. It stays absolutely positioned
          (grid-fixed center) until the card pops in below it, then fades. */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[10%] flex justify-center"
        initial={reduce ? { opacity: 0 } : { y: "-160%", rotate: -12, opacity: 1 }}
        animate={
          reduce
            ? { opacity: 0 }
            : {
                y: 0,
                rotate: [0, 3, -2, 0],
                opacity: 1,
                transition: {
                  y: {
                    type: "spring",
                    stiffness: 260,
                    damping: 13,
                    mass: 0.8,
                    duration: 0.9,
                  },
                  rotate: { delay: 0.5, duration: 0.5, ease: "easeOut" },
                  opacity: { duration: 0.2 },
                },
              }
        }
        style={{ zIndex: 30 }}
        aria-hidden="true"
      >
        <motion.div
          initial={false}
          animate={
            reduce ? undefined : entered ? { scale: 0.55, opacity: 0 } : { scale: [1, 1.1, 1] }
          }
          transition={
            reduce
              ? undefined
              : entered
                ? { duration: 0.35, ease: "easeIn" }
                : { delay: 0.5, duration: 0.45, ease: "easeOut" }
          }
        >
          <BagIcon />
        </motion.div>
      </motion.div>

      {/* Stage 2 of the entrance — the card pops out of the bag's position
          with spring physics into its final centered spot. */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={
          reduce
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.4, y: 40 }
        }
        animate={
          reduce
            ? { opacity: 1 }
            : {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 1.0,
                  opacity: { duration: 0.15 },
                },
              }
        }
        onAnimationComplete={(def) => {
          /* "scale" key settles last — treat it as the pop finishing. */
          if (typeof def === "object" && "scale" in def) setEntered(true);
        }}
      >
        {/* Header — bag settles here as the card's accent icon */}
        <div className="mb-6 text-center">
          <motion.div
            animate={
              reduce ? { scale: 1, opacity: 1 } : entered ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }
            }
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mb-3 inline-flex"
          >
            <BagIcon />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.12, duration: 0.4, ease: "easeOut" }}
            className="text-2xl font-bold tracking-tight text-white"
          >
            {config.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4, ease: "easeOut" }}
            className="mt-1.5 text-sm text-slate-400"
          >
            {config.subtitle}
          </motion.p>
        </div>

        <AuthCard>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <AuthForm
                mode={mode}
                showPassword={showPassword}
                showConfirm={showConfirm}
                name={name}
                email={email}
                password={password}
                confirm={confirm}
                rememberMe={rememberMe}
                error={error}
                shake={shake}
                isLoading={isLoading}
                onName={setName}
                onEmail={setEmail}
                onPassword={setPassword}
                onConfirm={setConfirm}
                onRememberMe={setRememberMe}
                onTogglePassword={() => setShowPassword((v) => !v)}
                onToggleConfirm={() => setShowConfirm((v) => !v)}
                onSwitchMode={() => switchMode(mode === "login" ? "signup" : "login")}
                onSubmit={handleSubmit}
              />
            </motion.div>
          </AnimatePresence>
        </AuthCard>
      </motion.div>
      </AuthBackground>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  BagIcon — the briefcase logo/mascot, shared by both entrance stages */
/* ------------------------------------------------------------------ */
function BagIcon() {
  return (
    <div className="relative inline-flex h-14 w-14 items-center justify-center">
      {/* Halo */}
      <div
        aria-hidden
        className="absolute -inset-2.5 rounded-2xl bg-indigo-500/30 blur-lg"
      />
      <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 ring-1 ring-white/10 backdrop-blur-sm">
        <Briefcase className="h-6 w-6 text-indigo-300" />
      </div>
    </div>
  );
}

export default AnimatedAuth;
