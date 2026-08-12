"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

// NOTE: This hook uses the free browser-native Web Speech Synthesis API
// (window.speechSynthesis) for text-to-speech as an MVP.
// It is intentionally isolated so it can later be swapped for a dedicated
// voice AI service (e.g. ElevenLabs, OpenAI TTS, PlayHT) for higher-quality
// voice output without rewriting the chat widget UI.

const noopSubscribe = () => () => {};

/**
 * Pick a natural-sounding voice if one is available. Preference order:
 *  1. Explicitly "natural" voices (Microsoft Online/Natural, Google Wavenet).
 *  2. Common natural-sounding female / neutral voice names.
 *  3. The browser's default voice.
 *  4. The first English voice, else the first voice of any locale.
 */
function pickPreferredVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pool = english.length ? english : voices;

  const naturalKeywords = /\b(natural|neural|enhanced|premium|wavenet|online)\b/i;
  const natural = pool.find((v) => naturalKeywords.test(v.name));
  if (natural) return natural;

  const preferredNames =
    /samantha|victoria|karen|moira|tessa|fiona|ava|allison|susan|kathy|zira|jenny|aria|nova/i;
  const preferred = pool.find((v) => preferredNames.test(v.name));
  if (preferred) return preferred;

  const def = pool.find((v) => v.default);
  if (def) return def;

  return pool[0];
}

export interface UseSpeechSynthesisResult {
  supported: boolean;
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
}

/**
 * Browser-native text-to-speech. Returns a stable speak/stop pair and
 * reflects whether the browser is currently producing speech.
 *
 * - speak() cancels any in-flight speech before starting the new utterance,
 *   so back-to-back calls cleanly interrupt.
 * - Voices may load asynchronously (Chrome, Edge); we subscribe to
 *   `voiceschanged` and poll as a fallback for older browsers.
 */
export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () =>
      typeof window !== "undefined" &&
      typeof window.speechSynthesis !== "undefined" &&
      typeof window.SpeechSynthesisUtterance !== "undefined",
    () => false
  );

  const [isSpeaking, setIsSpeaking] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  /* Load voices. The browser may populate them async, so we subscribe to
     voiceschanged and poll as a fallback (older Safari, etc.). */
  useEffect(() => {
    if (!supported) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) {
        voicesRef.current = v;
        if (!voiceRef.current) voiceRef.current = pickPreferredVoice(v);
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);

    let polls = 0;
    const interval = window.setInterval(() => {
      polls += 1;
      loadVoices();
      if (voicesRef.current.length > 0 || polls > 20) {
        window.clearInterval(interval);
      }
    }, 250);

    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", loadVoices);
      window.clearInterval(interval);
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!supported || !text.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice =
      voiceRef.current ??
      pickPreferredVoice(
        voicesRef.current.length
          ? voicesRef.current
          : window.speechSynthesis.getVoices()
      );
    if (voice) utterance.voice = voice;
    utterance.rate = 0.98;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [supported]);

  /* Stop any in-flight speech when the consuming component unmounts. */
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  return { supported, isSpeaking, speak, stop };
}
