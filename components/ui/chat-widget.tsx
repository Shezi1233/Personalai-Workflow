"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  Bot,
  MessageCircle,
  Mic,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

/* ------------------------------------------------------------------ */
/*  ChatWidget — floating RAG chatbot (bottom-right, every page)       */
/*                                                                      */
/*  - Floating gradient button with a pulse, opens a glassmorphic       */
/*    panel that springs up from the bottom-right.                      */
/*  - Messages: user right-aligned in accent gradient bubbles, bot      */
/*    left-aligned in glass bubbles. Typing dots while waiting.         */
/*  - session_id stored once per browser session in sessionStorage.     */
/*  - Full-width bottom sheet on small screens.                         */
/* ------------------------------------------------------------------ */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const SESSION_KEY = "chat_session_id";

type Message = { id: number; role: "user" | "bot"; text: string };

function sessionId(): string {
  if (typeof window === "undefined") return "anon";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/* ------------------------------------------------------------------ */
/*  BotMessageRow — a single assistant message with TTS playback      */
/* ------------------------------------------------------------------ */

interface BotMessageRowProps {
  message: Message;
  isSpeaking: boolean;
  onSpeak: () => void;
  reduce: boolean | null;
}

const SOUND_WAVES = [0.5, 1, 0.7, 1.3, 0.4];

function BotMessageRow({
  message,
  isSpeaking,
  onSpeak,
  reduce,
}: BotMessageRowProps) {
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-end gap-2"
    >
      {/* Avatar with speaking indicator */}
      <div className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center">
        <span
          aria-hidden
          className="absolute -inset-1 rounded-lg bg-indigo-500/30 blur-sm"
        />
        <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white ring-1 ring-white/20">
          <Bot className="h-3.5 w-3.5" />
        </span>

        {/* Animated sound-wave bars — only when this message is speaking */}
        {isSpeaking && !reduce && (
          <motion.span
            aria-hidden
            className="absolute -right-6 top-1/2 -translate-y-1/2 flex items-end gap-0.5"
          >
            {SOUND_WAVES.map((h, i) => (
              <motion.span
                key={i}
                className="w-0.5 rounded-t-xs bg-slate-400"
                style={{ height: `${h * 6}px` }}
                initial={{ scaleY: 0.2, opacity: 0.4 }}
                animate={{
                  scaleY: [0.2, h, 0.4],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.12,
                }}
              />
            ))}
          </motion.span>
        )}
      </div>

      {/* Speech bubble + playback controls */}
      <div className="group relative max-w-[78%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm leading-relaxed text-slate-200">
        {message.text}

        {/* Playback button — appears on hover for bot messages */}
        <motion.button
          type="button"
          onClick={onSpeak}
          aria-label={isSpeaking ? "Stop speech" : "Read aloud"}
          title={isSpeaking ? "Stop speech" : "Read aloud"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute top-1 right-1.5 rounded-full border transition-all",
            "border-white/15 bg-white/[0.05] text-slate-400",
            "hover:border-indigo-400/60 hover:text-indigo-300",
            "group-hover:opacity-100",
            isSpeaking && "opacity-100 text-indigo-300"
          )}
        >
          {isSpeaking ? (
            <VolumeX className="h-3 w-3" />
          ) : (
            <Volume2 className="h-3 w-3" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export function ChatWidget() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "bot",
      text: "Hi! I'm Malik's AI assistant. Ask me about his skills, projects, experience, or how to reach him.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Voice input (Stage 1): browser Web Speech API. */
  const [pendingSend, setPendingSend] = useState(false);
  const pendingTimerRef = useRef<number | null>(null);
  const sendRef = useRef<(text: string) => void>(() => {});
  const openRef = useRef(false);
  openRef.current = open;

  /* Voice output (Stage 2): browser Web Speech API. */
  const tts = useSpeechSynthesis();
  const [autoRead, setAutoRead] = useState(true);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const autoReadRef = useRef(true);
  const messagesRef = useRef<Message[]>(messages);

  /* Fired by the recognition hook once a listening session ends with speech.
     Populate the input, then auto-send ~1.2s later so the user has a beat
     to cancel (click the X / edit the text) before it sends. */
  const handleVoiceFinalized = useCallback((text: string) => {
    if (!openRef.current) return;
    setInput(text);
    setPendingSend(true);
    pendingTimerRef.current = window.setTimeout(() => {
      pendingTimerRef.current = null;
      setPendingSend(false);
      sendRef.current(text);
    }, 1200);
  }, []);

  const speech = useSpeechRecognition(handleVoiceFinalized);

  const liveTranscript = speech.isListening
    ? `${speech.transcript}${speech.interimTranscript ? ` ${speech.interimTranscript}` : ""}`
    : input;

  /* Persist the auto-read preference in localStorage. */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("chat_auto_read");
      if (stored !== null) setAutoRead(stored !== "false");
    } catch {
      /* localStorage unavailable (SSR / private mode) — keep default. */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("chat_auto_read", autoRead ? "true" : "false");
    } catch {
      /* */
    }
    /* Keep the ref mirrored so the TTS effect can read the latest value
       without needing to be in its dependency array. */
    autoReadRef.current = autoRead;
  }, [autoRead]);

  const cancelPending = useCallback(() => {
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    setPendingSend(false);
  }, []);

  const toggleChat = () => {
    if (open) {
      cancelPending();
      if (speech.isListening) speech.stop();
    }
    setOpen((o) => !o);
  };

  /* Keep the newest message in view. */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  /* Track latest messages for the TTS effect (avoids stale-closure re-adding). */
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /* ---- Voice output (Stage 2): auto-read bot responses via TTS ----- */
  /* On every new assistant message, speak it aloud when autoRead is on.
     We compare against the last spoken message id so we don't re-speak
     messages that were already read (e.g. after toggling autoRead off/on). */
  const lastSpokenIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!autoReadRef.current) return;
    const latest = messagesRef.current[messagesRef.current.length - 1];
    if (!latest || latest.role !== "bot") return;
    if (latest.id === lastSpokenIdRef.current) return;
    lastSpokenIdRef.current = latest.id;
    setSpeakingId(latest.id);
    tts.speak(latest.text);
  }, [messages, tts, autoRead]);

  /* Clear the speakingId when the TTS engine finishes or is stopped,
     so the animated "speaking" indicator disappears. */
  useEffect(() => {
    if (!tts.isSpeaking) {
      setSpeakingId(null);
    }
  }, [tts.isSpeaking]);

  /* Stop speech immediately when the panel closes or a new message is sent.
     (Per-message replay is handled via the onSpeak callback in BotMessageRow.) */
  useEffect(() => {
    if (!open) {
      tts.stop();
      setSpeakingId(null);
      lastSpokenIdRef.current = null;
    }
  }, [open, tts]);

  /* Focus the input when the panel opens. */
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || typing) return;

    cancelPending();
    /* Stop any in-flight speech when the user sends a new message. */
    tts.stop();
    setSpeakingId(null);
    const userMsg: Message = { id: nextId.current++, role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Something went wrong. Please try again."
        );
      }
      const botMsg: Message = {
        id: nextId.current++,
        role: "bot",
        text: data.answer ?? "No response.",
      };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the assistant.");
    } finally {
      setTyping(false);
    }
  };

  /* Keep sendRef pointing at the freshest closure (read by the voice
     auto-send timer). */
  sendRef.current = send;

  return (
    <>
      {/* Floating button */}
      <motion.button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        onClick={toggleChat}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.5)] sm:bottom-6 sm:right-6"
      >
        {/* Pulse ring */}
        {!open && (
          <span
            aria-hidden
            className="absolute inset-0 -z-10 animate-ping rounded-full bg-indigo-500/50"
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: 30, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: 30, scale: 0.96 }
            }
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed inset-x-3 bottom-20 z-[60] flex h-[70vh] max-h-[560px] flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] shadow-[0_24px_70px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[560px] sm:w-[380px]"
          >
            {/* Top accent tint + edge highlight */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 130% at 12% 8%, rgba(139,92,246,0.18) 0%, transparent 55%), radial-gradient(120% 130% at 92% 96%, rgba(56,189,248,0.12) 0%, transparent 55%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-6 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
              }}
            />
            <div
              aria-hidden
              className="noise-overlay pointer-events-none absolute inset-0"
            />

            {/* Header */}
            <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative inline-flex h-9 w-9 items-center justify-center">
                  <span
                    aria-hidden
                    className="absolute -inset-1.5 rounded-xl bg-indigo-500/40 blur-md"
                  />
                  <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white ring-1 ring-white/20">
                    <Bot className="h-4.5 w-4.5" />
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    Chat with Malik&apos;s AI Assistant
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        tts.isSpeaking ? "bg-rose-400" : "bg-emerald-400"
                      )}
                    />
                    {tts.isSpeaking ? "Speaking…" : "Online · Answers about Malik"}
                  </div>
                </div>
              </div>

              {/* Global auto-read toggle */}
              <motion.button
                type="button"
                onClick={() => {
                  const next = !autoRead;
                  setAutoRead(next);
                  if (!next) {
                    tts.stop();
                    setSpeakingId(null);
                    lastSpokenIdRef.current = null;
                  }
                }}
                aria-label={autoRead ? "Disable auto-read" : "Enable auto-read"}
                title={autoRead ? "Disable auto-read aloud" : "Enable auto-read aloud"}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                  "border-white/15 bg-white/[0.05]",
                  autoRead
                    ? "text-indigo-300 shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                    : "text-slate-500 hover:text-slate-300 hover:border-slate-400/50"
                )}
              >
                {autoRead ? (
                  <Volume2 className="h-3.5 w-3.5" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" />
                )}
              </motion.button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="relative flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((m) =>
                m.role === "bot" ? (
                  <BotMessageRow
                    key={m.id}
                    message={m}
                    isSpeaking={speakingId === m.id}
                    onSpeak={() => {
                      if (speakingId === m.id) {
                        tts.stop();
                        setSpeakingId(null);
                        lastSpokenIdRef.current = null;
                      } else {
                        tts.speak(m.text);
                        setSpeakingId(m.id);
                        lastSpokenIdRef.current = m.id;
                      }
                    }}
                    reduce={reduce}
                  />
                ) : (
                  <motion.div
                    key={m.id}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex justify-end"
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed",
                        "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-[0_4px_20px_-6px_rgba(139,92,246,0.6)]"
                      )}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                )
              )}

              {/* Typing indicator */}
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full bg-slate-400"
                        animate={reduce ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {error && (
                <p className="px-1 text-center text-xs text-rose-300">{error}</p>
              )}
              {speech.error && (
                <p className="px-1 text-center text-xs text-rose-300">
                  {speech.error}
                </p>
              )}
            </div>

            {/* Input */}
            <div className="relative border-t border-white/10 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={liveTranscript}
                  readOnly={speech.isListening}
                  onChange={(e) => {
                    if (speech.isListening) return;
                    if (pendingSend) cancelPending();
                    setInput(e.target.value);
                  }}
                  placeholder={
                    speech.isListening
                      ? pendingSend
                        ? "Preparing to send…"
                        : "Listening…"
                      : "Ask about Malik…"
                  }
                  className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20 disabled:cursor-not-allowed"
                />
                {speech.supported && (
                  <button
                    type="button"
                    onClick={() => {
                      if (speech.isListening) {
                        speech.stop();
                        return;
                      }
                      if (pendingSend) cancelPending();
                      speech.start();
                    }}
                    aria-label={
                      speech.isListening
                        ? "Stop listening"
                        : pendingSend
                          ? "Cancel auto-send"
                          : "Ask with your voice"
                    }
                    title={
                      speech.isListening
                        ? "Stop listening"
                        : pendingSend
                          ? "Cancel auto-send"
                          : "Ask with your voice"
                    }
                    className={cn(
                      "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-95",
                      speech.isListening
                        ? "border-rose-400/60 bg-rose-500/20 text-rose-300 shadow-[0_0_18px_rgba(244,63,94,0.5)]"
                        : pendingSend
                          ? "border-white/15 bg-white/[0.05] text-slate-300 hover:scale-105 hover:border-rose-400/50 hover:text-rose-300"
                          : "border-white/15 bg-white/[0.05] text-slate-300 hover:scale-105 hover:border-indigo-400/60 hover:text-indigo-300"
                    )}
                  >
                    {speech.isListening && (
                      <span
                        aria-hidden
                        className="absolute inset-0 -z-10 animate-ping rounded-full bg-rose-500/40"
                      />
                    )}
                    {speech.isListening || pendingSend ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!liveTranscript.trim() || typing || speech.isListening}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-[0_0_16px_rgba(139,92,246,0.45)] transition-transform duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatWidget;
