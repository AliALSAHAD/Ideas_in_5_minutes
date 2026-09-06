import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTime, playDoneSound } from '../utils/audio';

const RING_CIRCUMFERENCE = 540.35; // 2π × 86

export function useTimer(onDone) {
  const [totalSec, setTotalSec] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // Start a new session (supports minutes or specific seconds)
  const start = useCallback((minutes, seconds = 0) => {
    const sec = seconds > 0 ? seconds : Math.round(minutes * 60);
    setTotalSec(sec);
    setRemaining(sec);
    setIsPaused(false);
    setIsRunning(true);
  }, []);

  // Toggle pause
  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  // Reset everything
  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setTotalSec(0);
    setRemaining(0);
  }, []);

  // Tick
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      if (isPaused) return;

      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          playDoneSound();
          onDone?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, onDone]);

  // Derived values
  const displayTime = formatTime(remaining);
  const progress = totalSec > 0 ? remaining / totalSec : 1;
  const ringOffset = RING_CIRCUMFERENCE * (1 - progress);
  const isWarning = progress <= 0.25 && isRunning;

  return {
    start,
    reset,
    togglePause,
    isPaused,
    isRunning,
    displayTime,
    ringOffset,
    isWarning,
    remaining,
    totalSec,
  };
}
