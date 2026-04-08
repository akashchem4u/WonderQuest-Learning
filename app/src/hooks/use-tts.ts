"use client";
import { useCallback, useRef } from "react";

export function useTTS() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number }) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    // Cancel any current speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 0.9;  // Slightly slower for kids
    utterance.pitch = options?.pitch ?? 1.1; // Slightly higher for engagement
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  return { speak, stop };
}
