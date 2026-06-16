import { useRef, useCallback } from 'react';

export function useSpeech() {
  const queueRef     = useRef([]);
  const speakingRef  = useRef(false);
  const enabledRef   = useRef(true);

  const processQueue = useCallback(() => {
    if (speakingRef.current || queueRef.current.length === 0) return;
    const text = queueRef.current.shift();
    const utt  = new SpeechSynthesisUtterance(text);
    utt.rate  = 1.05;
    utt.pitch = 0.9;
    speakingRef.current = true;
    utt.onend = utt.onerror = () => {
      speakingRef.current = false;
      processQueue();
    };
    window.speechSynthesis.speak(utt);
  }, []);

  const speak = useCallback((text, priority = false) => {
    if (!enabledRef.current) return;
    if (priority) {
      window.speechSynthesis.cancel();
      queueRef.current   = [];
      speakingRef.current = false;
    }
    if (queueRef.current.length > 2) return;
    queueRef.current.push(text);
    processQueue();
  }, [processQueue]);

  const setEnabled = useCallback((val) => {
    enabledRef.current = val;
    if (!val) {
      window.speechSynthesis.cancel();
      queueRef.current    = [];
      speakingRef.current = false;
    }
  }, []);

  return { speak, setEnabled };
}
