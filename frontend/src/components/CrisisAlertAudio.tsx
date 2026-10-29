"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function playbackError(cause: unknown) {
  return cause instanceof DOMException && cause.name === "NotAllowedError"
    ? "قد يمنع المتصفح التشغيل التلقائي. اضغط «تشغيل صوت التنبيه» للسماح به."
    : "تعذّر تشغيل صوت التنبيه. تحقق من رابط الملف وإعدادات الصوت.";
}

export default function CrisisAlertAudio({ src, repeatSeconds }: { src: string; repeatSeconds: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const attemptRef = useRef(0);
  const [enabled, setEnabled] = useState(false);
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState("");
  const repeatDelay = Math.max(15, Math.min(3600, repeatSeconds)) * 1000;

  function clearPlayback() {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
  }

  const scheduleRepeat = useCallback((audio: HTMLAudioElement) => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (audio.paused || audio.ended) {
        audio.currentTime = 0;
        void audio.play().catch(() => {
          if (timerRef.current !== null) window.clearInterval(timerRef.current);
          timerRef.current = null;
          audio.pause();
          if (audioRef.current === audio) audioRef.current = null;
          setEnabled(false);
          setError("تعذّر تشغيل صوت التنبيه. تحقق من إعدادات الصوت.");
        });
      }
    }, repeatDelay);
  }, [repeatDelay]);

  useEffect(() => {
    let active = true;
    const attempt = ++attemptRef.current;
    const audio = new Audio(src);
    audio.preload = "auto";
    audioRef.current = audio;
    setStarting(true);

    void audio.play().then(() => {
      if (!active || attempt !== attemptRef.current) { audio.pause(); return; }
      scheduleRepeat(audio);
      setEnabled(true);
      setStarting(false);
      setError("");
    }).catch((cause: unknown) => {
      if (!active || attempt !== attemptRef.current) return;
      audio.pause();
      if (audioRef.current === audio) audioRef.current = null;
      setEnabled(false);
      setStarting(false);
      setError(playbackError(cause));
    });

    return () => {
      active = false;
      attemptRef.current += 1;
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      audio.pause();
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [scheduleRepeat, src]);

  async function toggle() {
    setError("");
    if (enabled || starting) {
      attemptRef.current += 1;
      clearPlayback();
      setEnabled(false);
      setStarting(false);
      return;
    }

    const attempt = ++attemptRef.current;
    const audio = new Audio(src);
    audio.preload = "auto";
    audioRef.current = audio;
    setStarting(true);
    try {
      await audio.play();
      if (attempt !== attemptRef.current) { audio.pause(); return; }
      scheduleRepeat(audio);
      setEnabled(true);
    } catch (cause: unknown) {
      if (attempt !== attemptRef.current) return;
      audio.pause();
      if (audioRef.current === audio) audioRef.current = null;
      setError(playbackError(cause));
    } finally {
      if (attempt === attemptRef.current) setStarting(false);
    }
  }

  const active = enabled || starting;
  return <span className="crisis-audio-control">
    <button type="button" className="crisis-bar__cta crisis-audio-button" onClick={() => void toggle()} aria-pressed={active} aria-label={active ? "إيقاف صوت تنبيه الأزمة" : "تشغيل صوت تنبيه الأزمة"}>
      {active ? "إيقاف صوت التنبيه" : "تشغيل صوت التنبيه"}
    </button>
    {error && <span className="crisis-audio-error" role="status">{error}</span>}
  </span>;
}
