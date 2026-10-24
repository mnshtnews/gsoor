"use client";

import { useEffect, useRef, useState } from "react";

export default function CrisisAlertAudio({ src, repeatSeconds }: { src: string; repeatSeconds: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    audioRef.current?.pause();
    audioRef.current = null;
  }, [src]);

  async function toggle() {
    setError("");
    if (enabled) {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      audioRef.current?.pause();
      setEnabled(false);
      return;
    }
    const audio = new Audio(src);
    audio.preload = "none";
    try {
      await audio.play();
      audioRef.current = audio;
      timerRef.current = window.setInterval(() => {
        if (audio.paused || audio.ended) {
          audio.currentTime = 0;
          void audio.play().catch(() => setError("تعذّر تشغيل صوت التنبيه. تحقق من إعدادات الصوت."));
        }
      }, Math.max(15, Math.min(3600, repeatSeconds)) * 1000);
      setEnabled(true);
    } catch {
      setError("اضغط مرة أخرى للسماح بتشغيل صوت التنبيه.");
    }
  }

  return <span className="crisis-audio-control">
    <button type="button" className="crisis-bar__cta crisis-audio-button" onClick={() => void toggle()} aria-pressed={enabled} aria-label={enabled ? "إيقاف صوت تنبيه الأزمة" : "تشغيل صوت تنبيه الأزمة"}>
      {enabled ? "إيقاف الصوت" : "تشغيل صوت التنبيه"}
    </button>
    {error && <span className="crisis-audio-error" role="status">{error}</span>}
  </span>;
}