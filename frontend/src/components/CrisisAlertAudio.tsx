"use client";

import { useEffect, useRef, useState } from "react";

export default function CrisisAlertAudio({ src, repeatSeconds }: { src: string; repeatSeconds: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const muteKey = `crisis-alert-muted:${src}`;

  useEffect(() => {
    let cancelled = false;
    const start = async (automatic: boolean) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      try {
        await audio.play();
        if (cancelled) { audio.pause(); return; }
        audioRef.current = audio;
        timerRef.current = window.setInterval(() => {
          if (audio.paused || audio.ended) {
            audio.currentTime = 0;
            void audio.play().catch(() => setError("تعذّر تشغيل صوت التنبيه. تحقق من إعدادات الصوت."));
          }
        }, Math.max(15, Math.min(3600, repeatSeconds)) * 1000);
        setEnabled(true);
        setError("");
      } catch {
        audio.pause();
        if (!cancelled) {
          setEnabled(false);
          setError(automatic ? "قد يمنع المتصفح التشغيل التلقائي. اضغط «تشغيل صوت التنبيه» للسماح به." : "تعذّر تشغيل صوت التنبيه. تحقق من إعدادات الصوت.");
        }
      }
    };

    if (window.localStorage.getItem(muteKey) !== "true") void start(true);
    else setEnabled(false);
    return () => {
      cancelled = true;
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [muteKey, repeatSeconds, src]);

  async function toggle() {
    setError("");
    if (enabled) {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      audioRef.current?.pause();
      audioRef.current = null;
      window.localStorage.setItem(muteKey, "true");
      setEnabled(false);
      return;
    }
    window.localStorage.removeItem(muteKey);
    const audio = new Audio(src);
    audio.preload = "auto";
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
      setError("تعذّر تشغيل صوت التنبيه. تحقق من إعدادات الصوت.");
    }
  }

  return <span className="crisis-audio-control">
    <button type="button" className="crisis-bar__cta crisis-audio-button" onClick={() => void toggle()} aria-pressed={enabled} aria-label={enabled ? "إيقاف صوت تنبيه الأزمة" : "تشغيل صوت تنبيه الأزمة"}>
      {enabled ? "إيقاف صوت التنبيه" : "تشغيل صوت التنبيه"}
    </button>
    {error && <span className="crisis-audio-error" role="status">{error}</span>}
  </span>;
}
