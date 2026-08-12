"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

// NOTE: This hook uses the free browser-native Web Speech API
// (SpeechRecognition / webkitSpeechRecognition) for speech-to-text as an MVP.
// It is intentionally isolated so it can later be swapped for a dedicated
// voice AI service (e.g. Whisper API) for higher-quality transcription
// without rewriting the chat widget UI.

/* ------------------------------------------------------------------ */
/*  Minimal typing — the Web Speech recognition API is not part of the */
/*  standard lib.dom TS types, so we declare just what we use.         */
/* ------------------------------------------------------------------ */

interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    [index: number]: { transcript: string };
  }>;
}

interface RecognitionErrorEvent {
  error: string;
}

interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onspeechend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type RecognitionCtor = new () => Recognition;

/* Stop listening after ~1.8s of silence (natural pause between questions). */
const SILENCE_TIMEOUT_MS = 1800;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/* Support is browser-only (Firefox has none). useSyncExternalStore keeps
   the SSR snapshot (false) different from the client snapshot (true)
   without a hydration mismatch and without effect-driven setState. */
const noopSubscribe = () => () => {};

export interface UseSpeechRecognitionResult {
  isListening: boolean;
  /** Finalized transcript, accumulated across all utterances this session. */
  transcript: string;
  /** Live (not-yet-final) partial transcript for the current utterance. */
  interimTranscript: string;
  error: string | null;
  supported: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * @param onFinalized Called once per listening session with the final
 *   transcript, when the session ends with non-empty speech (manual stop,
 *   silence timeout, or the browser ending recognition). Used by the widget
 *   to auto-send the question.
 */
export function useSpeechRecognition(
  onFinalized?: (transcript: string) => void
): UseSpeechRecognitionResult {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => getRecognitionCtor() !== null,
    () => false
  );
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<Recognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const finalRef = useRef("");
  const interimRef = useRef("");
  const finalizedRef = useRef(true);
  const onFinalizedRef = useRef(onFinalized);

  useEffect(() => {
    onFinalizedRef.current = onFinalized;
  }, [onFinalized]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const foldInterimIntoFinal = useCallback(() => {
    if (interimRef.current) {
      finalRef.current = `${finalRef.current} ${interimRef.current}`.trim();
      interimRef.current = "";
      setTranscript(finalRef.current);
    }
    setInterimTranscript("");
  }, []);

  /* Deliver the final transcript to the consumer exactly once per session. */
  const deliverFinal = useCallback(() => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    const text = finalRef.current.trim();
    if (text) onFinalizedRef.current?.(text);
  }, []);

  const start = useCallback(() => {
    if (isListening) return;
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      clearSilenceTimer();
    };

    /* New speech detected — keep the silence timer fresh. */
    const scheduleSilenceStop = () => {
      clearSilenceTimer();
      silenceTimerRef.current = window.setTimeout(() => {
        try {
          recognition.stop();
        } catch {
          /* recognition already stopped */
        }
      }, SILENCE_TIMEOUT_MS);
    };

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalRef.current = `${finalRef.current} ${result[0].transcript}`.trim();
        } else {
          interim += result[0].transcript;
        }
      }
      interimRef.current = interim;
      setTranscript(finalRef.current);
      setInterimTranscript(interim);
      setError(null);
      scheduleSilenceStop();
    };

    recognition.onspeechend = () => {
      scheduleSilenceStop();
    };

    recognition.onerror = (event) => {
      /* Do not deliver a (likely partial) transcript after an error. */
      finalizedRef.current = true;
      const denied =
        event.error === "not-allowed" ||
        event.error === "service-not-allowed" ||
        event.error === "audio-capture";
      const msg = denied
        ? "Microphone access denied"
        : `Speech recognition error: ${event.error}`;
      setError(msg);
      clearSilenceTimer();
      setInterimTranscript("");
      recognitionRef.current = null;
      setIsListening(false);
      window.setTimeout(
        () => setError((current) => (current === msg ? null : current)),
        5000
      );
    };

    recognition.onend = () => {
      foldInterimIntoFinal();
      deliverFinal();
      clearSilenceTimer();
      recognitionRef.current = null;
      setIsListening(false);
    };

    /* Fresh session — wipe previous transcript. */
    recognitionRef.current = recognition;
    finalRef.current = "";
    interimRef.current = "";
    finalizedRef.current = false;
    setTranscript("");
    setInterimTranscript("");
    setError(null);

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setError("Could not start speech recognition");
      recognitionRef.current = null;
      setIsListening(false);
    }
  }, [isListening, clearSilenceTimer, foldInterimIntoFinal, deliverFinal]);

  const stop = useCallback(() => {
    clearSilenceTimer();
    /* Fold any pending interim so the last words aren't lost, then deliver
       the final transcript (the widget auto-sends from it). */
    foldInterimIntoFinal();
    deliverFinal();
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    }
    setIsListening(false);
  }, [clearSilenceTimer, foldInterimIntoFinal, deliverFinal]);

  const reset = useCallback(() => {
    clearSilenceTimer();
    finalizedRef.current = true;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      try {
        recognition.abort();
      } catch {
        /* already stopped */
      }
    }
    finalRef.current = "";
    interimRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setIsListening(false);
    setError(null);
  }, [clearSilenceTimer]);

  /* Abort recognition cleanly when the component unmounts. */
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      const recognition = recognitionRef.current;
      if (recognition) {
        try {
          recognition.abort();
        } catch {
          /* already stopped */
        }
      }
    };
  }, [clearSilenceTimer]);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    supported,
    start,
    stop,
    reset,
  };
}
