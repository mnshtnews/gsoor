"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type CropRequest = { file: File; ratio: number | null };

export function useImageCropper() {
  const [request, setRequest] = useState<CropRequest | null>(null);
  const resolve = useRef<((file: File | null) => void) | null>(null);
  const cropImage = (file: File, ratio: number | null): Promise<File | null> => new Promise((done) => {
    resolve.current = done;
    setRequest({ file, ratio });
  });
  const finish = (file: File | null) => {
    resolve.current?.(file);
    resolve.current = null;
    setRequest(null);
  };
  return { cropImage, cropper: request ? <ImageCropDialog request={request} onFinish={finish} /> : null };
}

function ImageCropDialog({ request, onFinish }: { request: CropRequest; onFinish: (file: File | null) => void }) {
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ left: 0, top: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [ratio, setRatio] = useState(request.ratio);
  useEffect(() => {
    const next = URL.createObjectURL(request.file); setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [request.file]);
  useEffect(() => { setRatio(request.ratio); setZoom(1); setNatural({ width: 0, height: 0 }); }, [request.file, request.ratio]);
  useEffect(() => {
    if (!frame.current) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(frame.current);
    return () => observer.disconnect();
  }, [ratio]);
  const cropRatio = ratio ?? (natural.width && natural.height ? natural.width / natural.height : 16 / 9);
  const frameWidth = size.width;
  const frameHeight = frameWidth ? frameWidth / cropRatio : 0;
  const baseScale = natural.width && frameWidth ? Math.max(frameWidth / natural.width, frameHeight / natural.height) * zoom : 1;
  const imageWidth = natural.width * baseScale;
  const imageHeight = natural.height * baseScale;
  useEffect(() => {
    if (!frameWidth || !natural.width) return;
    setOffset({ left: (frameWidth - imageWidth) / 2, top: (frameHeight - imageHeight) / 2 });
  // Keep initial centering tied to a new source/ratio/zoom.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameWidth, frameHeight, natural.width, natural.height, zoom]);
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, left: offset.left, top: offset.top };
  }
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const width = frame.current?.clientWidth ?? 0, height = frame.current?.clientHeight ?? 0;
    setOffset({ left: Math.min(0, Math.max(width - imageWidth, drag.current.left + event.clientX - drag.current.x)), top: Math.min(0, Math.max(height - imageHeight, drag.current.top + event.clientY - drag.current.y)) });
  }
  async function save() {
    if (!image.current || !frame.current || !natural.width) return;
    setBusy(true); setError("");
    try {
      const scale = imageWidth / natural.width;
      const sx = Math.max(0, -offset.left / scale), sy = Math.max(0, -offset.top / scale);
      const sw = Math.min(natural.width - sx, frame.current.clientWidth / scale);
      const sh = Math.min(natural.height - sy, frame.current.clientHeight / scale);
      const outWidth = Math.min(2400, Math.round(sw));
      const canvas = document.createElement("canvas");
      canvas.width = outWidth; canvas.height = Math.max(1, Math.round(outWidth * sh / sw));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("تعذّر تجهيز الصورة.");
      context.drawImage(image.current, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("تعذّر حفظ الصورة.")), "image/jpeg", .94));
      onFinish(new File([blob], request.file.name.replace(/\.[^.]+$/, "") + "-cropped.jpg", { type: "image/jpeg", lastModified: Date.now() }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر قص الصورة."); setBusy(false); }
  }
  return <div className="cms-revision cms-image-crop-modal" role="dialog" aria-modal="true" aria-labelledby="image-crop-title">
    <div className="cms-image-crop-head"><div><h2 id="image-crop-title">قص الصورة قبل الرفع</h2><p>اسحب الصورة داخل الإطار وحدد الجزء الذي تريد إظهاره.</p></div><button type="button" className="cms-btn" onClick={() => onFinish(null)}>إغلاق</button></div>
    <div ref={frame} className="cms-image-crop-frame" style={{ aspectRatio: String(cropRatio), touchAction: "none" }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      {url && <Image ref={image} src={url} alt="معاينة قص الصورة" width={natural.width || 1} height={natural.height || 1} unoptimized draggable={false} onLoad={(event) => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} style={{ position: "absolute", maxWidth: "none", width: imageWidth, height: imageHeight, left: offset.left, top: offset.top, userSelect: "none", pointerEvents: "none" }} />}
      <span className="cms-image-crop-guides" aria-hidden="true" />
    </div>
    <div className="cms-image-crop-controls"><label>نسبة القص<select value={ratio ?? "original"} onChange={(event) => { setRatio(event.target.value === "original" ? null : Number(event.target.value)); setZoom(1); }}><option value="original">الأصلية</option><option value={16 / 9}>عريضة 16:9</option><option value={4 / 3}>صورة 4:3</option><option value={1}>مربعة 1:1</option></select></label><label className="cms-image-crop-zoom">تكبير الصورة<input type="range" min="1" max="3" step=".05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label></div>
    {error && <p className="cms-msg error">{error}</p>}
    <div className="cms-actions"><button type="button" className="cms-btn" disabled={busy} onClick={() => onFinish(null)}>إلغاء</button><button type="button" className="cms-btn primary" disabled={busy || !natural.width} onClick={() => void save()}>{busy ? "جارٍ تجهيز الصورة…" : "اعتماد القص"}</button></div>
  </div>;
}
