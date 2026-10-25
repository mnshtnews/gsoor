"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type CropRequest = { file: File; ratio: number | null };
type Rect = { x: number; y: number; width: number; height: number };
type Handle = "nw" | "ne" | "sw" | "se";
type DragState = { mode: "move" | "resize"; handle?: Handle; pointerX: number; pointerY: number; rect: Rect };

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
  const stage = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const drag = useRef<DragState | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState<Rect | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    const next = URL.createObjectURL(request.file);
    setUrl(next);
    setNatural({ width: 0, height: 0 });
    setCrop(null);
    return () => URL.revokeObjectURL(next);
  }, [request.file]);

  useEffect(() => {
    if (!stage.current) return;
    const observer = new ResizeObserver(([entry]) => setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  const imageBox = (() => {
    if (!stageSize.width || !stageSize.height || !natural.width || !natural.height) return { x: 0, y: 0, width: 0, height: 0 };
    const scale = Math.min(stageSize.width / natural.width, stageSize.height / natural.height);
    const width = natural.width * scale, height = natural.height * scale;
    return { x: (stageSize.width - width) / 2, y: (stageSize.height - height) / 2, width, height };
  })();

  useEffect(() => {
    if (!imageBox.width || !imageBox.height) return;
    const inset = 0.06;
    let width = imageBox.width * (1 - inset * 2);
    let height = imageBox.height * (1 - inset * 2);
    if (request.ratio && request.ratio > 0) {
      if (width / height > request.ratio) width = height * request.ratio;
      else height = width / request.ratio;
    }
    setCrop({ x: imageBox.x + (imageBox.width - width) / 2, y: imageBox.y + (imageBox.height - height) / 2, width, height });
  // Refit the initial selection when the source or viewport changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageSize.width, stageSize.height, natural.width, natural.height, request.file]);

  function startDrag(event: React.PointerEvent<HTMLElement>, mode: DragState["mode"], handle?: Handle) {
    if (!crop) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { mode, handle, pointerX: event.clientX, pointerY: event.clientY, rect: crop };
  }

  function updateDrag(event: React.PointerEvent<HTMLDivElement>) {
    const active = drag.current;
    if (!active || !crop) return;
    const dx = event.clientX - active.pointerX, dy = event.clientY - active.pointerY;
    if (active.mode === "move") {
      setCrop({ ...active.rect, x: Math.min(imageBox.x + imageBox.width - active.rect.width, Math.max(imageBox.x, active.rect.x + dx)), y: Math.min(imageBox.y + imageBox.height - active.rect.height, Math.max(imageBox.y, active.rect.y + dy)) });
      return;
    }
    const rightEdge = active.rect.x + active.rect.width, bottomEdge = active.rect.y + active.rect.height;
    let left = active.rect.x, right = rightEdge, top = active.rect.y, bottom = bottomEdge;
    if (active.handle?.includes("w")) left = Math.max(imageBox.x, Math.min(rightEdge - 48, active.rect.x + dx));
    if (active.handle?.includes("e")) right = Math.min(imageBox.x + imageBox.width, Math.max(left + 48, rightEdge + dx));
    if (active.handle?.includes("n")) top = Math.max(imageBox.y, Math.min(bottomEdge - 48, active.rect.y + dy));
    if (active.handle?.includes("s")) bottom = Math.min(imageBox.y + imageBox.height, Math.max(top + 48, bottomEdge + dy));
    setCrop({ x: left, y: top, width: right - left, height: bottom - top });
  }

  async function save() {
    if (!image.current || !crop || !imageBox.width || !natural.width) return;
    setBusy(true); setError("");
    try {
      const scale = natural.width / imageBox.width;
      const sx = Math.max(0, (crop.x - imageBox.x) * scale);
      const sy = Math.max(0, (crop.y - imageBox.y) * scale);
      const sw = Math.min(natural.width - sx, crop.width * scale);
      const sh = Math.min(natural.height - sy, crop.height * scale);
      const canvas = document.createElement("canvas");
      const outputScale = Math.min(1, 3000 / Math.max(sw, sh));
      canvas.width = Math.max(1, Math.round(sw * outputScale));
      canvas.height = Math.max(1, Math.round(sh * outputScale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("تعذّر تجهيز الصورة.");
      context.drawImage(image.current, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("تعذّر حفظ الصورة.")), "image/jpeg", .94));
      onFinish(new File([blob], request.file.name.replace(/\.[^.]+$/, "") + "-cropped.jpg", { type: "image/jpeg", lastModified: Date.now() }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذّر قص الصورة.");
      setBusy(false);
    }
  }

  const handles: Handle[] = ["nw", "ne", "sw", "se"];
  return <div className="cms-revision cms-image-crop-modal" role="dialog" aria-modal="true" aria-labelledby="image-crop-title">
    <div className="cms-image-crop-head"><div><h2 id="image-crop-title">قص الصورة قبل الرفع</h2><p>اسحب الإطار لتحديد موضع القص، أو اسحب أي زاوية لتغيير العرض والارتفاع بحرية.</p></div><button type="button" className="cms-btn" onClick={() => onFinish(null)}>إغلاق</button></div>
    <div ref={stage} className="cms-image-crop-stage" onPointerMove={updateDrag} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      {url && <Image ref={image} src={url} alt="معاينة الصورة" width={natural.width || 1} height={natural.height || 1} unoptimized draggable={false} onLoad={(event) => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} style={{ position: "absolute", left: imageBox.x, top: imageBox.y, width: imageBox.width, height: imageBox.height, maxWidth: "none", userSelect: "none", pointerEvents: "none" }} />}
      {crop && <div className="cms-image-crop-selection" style={{ left: crop.x, top: crop.y, width: crop.width, height: crop.height }} onPointerDown={(event) => startDrag(event, "move")}>
        <span className="cms-image-crop-guides" aria-hidden="true" />
        {handles.map((handle) => <button key={handle} type="button" className={`cms-image-crop-handle cms-image-crop-handle--${handle}`} aria-label="تغيير حدود القص" onPointerDown={(event) => startDrag(event, "resize", handle)} />)}
      </div>}
    </div>
    {error && <p className="cms-msg error">{error}</p>}
    <div className="cms-actions"><button type="button" className="cms-btn" disabled={busy} onClick={() => onFinish(null)}>إلغاء</button><button type="button" className="cms-btn primary" disabled={busy || !crop} onClick={() => void save()}>{busy ? "جارٍ تجهيز الصورة…" : "اعتماد القص"}</button></div>
  </div>;
}
