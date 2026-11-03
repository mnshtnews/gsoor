"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export function WelcomeIntro({ enabled, videoUrl }: { enabled: boolean; videoUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shownForThisMount = useRef(false);

  const showIntro = useCallback(() => {
    if (!videoUrl) return;
    setMuted(true);
    setOpen(true);
  }, [videoUrl]);

  useEffect(() => {
    if (enabled && videoUrl && !shownForThisMount.current) {
      shownForThisMount.current = true;
      showIntro();
    }
    const replay = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-replay-intro]")) {
        event.preventDefault();
        showIntro();
      }
    };
    document.addEventListener("click", replay);
    return () => document.removeEventListener("click", replay);
  }, [enabled, videoUrl, showIntro]);

  useEffect(() => {
    document.body.classList.toggle("intro-locked", open);
    if (open) void videoRef.current?.play().catch(() => {});
    return () => document.body.classList.remove("intro-locked");
  }, [open]);

  if (!open || !videoUrl) return null;

  return (
    <div className="intro-overlay open" role="dialog" aria-modal="true" aria-label="الفيديو التعريفي بمنصة جسور">
      <div className="intro-stage">
        <div className="intro-bar top" />
        <div className="intro-bar bottom" />
        <video ref={videoRef} className="intro-video is-ready" src={videoUrl} autoPlay muted={muted} playsInline preload="auto" onEnded={() => setOpen(false)} onError={() => setOpen(false)} />
        <div className="intro-scrim" />
        <div className="intro-brand"><Image src="/assets/josour-logo-client.jpg" alt="" width={1104} height={974} /><span>جسور</span></div>
        <button className="intro-skip" type="button" onClick={() => setOpen(false)}>تخطي</button>
        <button className="intro-sound" type="button" aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"} onClick={() => setMuted((value) => !value)}>{muted ? "🔇" : "🔊"}</button>
        <div className="intro-captions"><span className="intro-caption-eyebrow show">منصة المصريين بالخارج</span><h2 className="intro-caption-title show">أخبار جسور وخدماتها أينما كنت</h2></div>
      </div>
    </div>
  );
}
