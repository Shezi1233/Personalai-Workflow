"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";

import {
  AuthBackground,
  TiltCard,
  GlassField,
  SubmitButton,
  DividerOr,
  GoogleButton,
  PasswordToggle,
  LogoBadge,
} from "@/components/ui/auth-shared";

type SignUpCard2Props = {
  brandName?: string;
  logoLetter?: string;
};

export function Component({
  brandName = "StyleMe",
  logoLetter = "S",
}: SignUpCard2Props = {}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <AuthBackground>
      <TiltCard>
        {/* Header */}
        <div className="text-center space-y-1 mb-5">
          <LogoBadge letter={logoLetter} />

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
          >
            Create Account
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-xs"
          >
            Join {brandName} — it takes less than a minute
          </motion.p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {/* Full name */}
            <GlassField
              icon={User}
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              focused={focusedInput === "name"}
              onFocusChange={(f) => setFocusedInput(f ? "name" : null)}
              autoComplete="name"
            />

            {/* Email */}
            <GlassField
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              focused={focusedInput === "email"}
              onFocusChange={(f) => setFocusedInput(f ? "email" : null)}
              autoComplete="email"
              inputMode="email"
            />

            {/* Password */}
            <GlassField
              icon={Lock}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              focused={focusedInput === "password"}
              onFocusChange={(f) => setFocusedInput(f ? "password" : null)}
              autoComplete="new-password"
              trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
            />

            {/* Confirm password */}
            <GlassField
              icon={Lock}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              focused={focusedInput === "confirm"}
              onFocusChange={(f) => setFocusedInput(f ? "confirm" : null)}
              autoComplete="new-password"
              trailing={<PasswordToggle shown={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />}
            />
          </div>

          {/* Terms */}
          <div className="flex items-center space-x-2 pt-1">
            <div className="relative">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms(!acceptedTerms)}
                className="appearance-none h-4 w-4 rounded border border-white/20 bg-white/5 checked:bg-white checked:border-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-200"
              />
              {acceptedTerms && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center text-black pointer-events-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </motion.div>
              )}
            </div>
            <label htmlFor="terms" className="text-xs text-white/60 hover:text-white/80 transition-colors duration-200">
              I agree to the{" "}
              <Link href="#" className="text-white hover:text-white/70 transition-colors duration-200 font-medium">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-white hover:text-white/70 transition-colors duration-200 font-medium">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Create account */}
          <SubmitButton isLoading={isLoading} label="Create Account" />

          {/* Divider */}
          <DividerOr />

          {/* Google */}
          <GoogleButton label="Sign up with Google" />

          {/* Sign in link */}
          <motion.p
            className="text-center text-xs text-white/60 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Already have an account?{" "}
            <Link href="/login" className="relative inline-block group/signin">
              <span className="relative z-10 text-white group-hover/signin:text-white/70 transition-colors duration-300 font-medium">
                Sign in
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover/signin:w-full transition-all duration-300" />
            </Link>
          </motion.p>
        </form>
      </TiltCard>
    </AuthBackground>
  );
}

export default Component;
