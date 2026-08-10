"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MailCheck } from "lucide-react";

import {
  AuthBackground,
  TiltCard,
  GlassField,
  SubmitButton,
  LogoBadge,
} from "@/components/ui/auth-shared";

type ForgotPasswordCardProps = {
  brandName?: string;
  logoLetter?: string;
};

export function Component({
  brandName = "StyleMe",
  logoLetter = "S",
}: ForgotPasswordCardProps = {}) {
  const [email, setEmail] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
    }, 2000);
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
            {sent ? "Check your inbox" : "Reset password"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-xs"
          >
            {sent
              ? `We sent a reset link to ${email || "your email"} — it expires in 10 minutes.`
              : `Enter your ${brandName} email and we'll send you a reset link.`}
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <MailCheck className="h-5 w-5 text-white/70" />
              </div>

              <Link
                href="/login"
                className="relative inline-block group/back text-xs"
              >
                <span className="relative z-10 text-white group-hover/back:text-white/70 transition-colors duration-300 font-medium">
                  Back to sign in
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover/back:w-full transition-all duration-300" />
              </Link>

              <Link
                href="/login"
                className="text-xs text-white/60 hover:text-white/80 transition-colors duration-200"
              >
                Didn&apos;t get it? Try again
              </Link>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
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

              <SubmitButton isLoading={isLoading} label="Send Reset Link" showArrow={false} />

              <motion.p
                className="text-center text-xs text-white/60 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Remembered it?{" "}
                <Link href="/login" className="relative inline-block group/back">
                  <span className="relative z-10 text-white group-hover/back:text-white/70 transition-colors duration-300 font-medium">
                    Sign in
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover/back:w-full transition-all duration-300" />
                </Link>
              </motion.p>
            </motion.form>
          )}
        </AnimatePresence>
      </TiltCard>
    </AuthBackground>
  );
}

export default Component;
