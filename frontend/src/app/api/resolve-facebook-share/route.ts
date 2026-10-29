import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CMS_COOKIE, decodeTokenClaims, forbiddenOrigin, isSameOrigin } from "@/lib/server/backend";

const FACEBOOK_HOSTS = new Set(["facebook.com", "www.facebook.com", "m.facebook.com", "fb.watch"]);
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  const token = (await cookies()).get(CMS_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "سجّل الدخول إلى لوحة التحرير أولًا." }, { status: 401 });
  const { exp } = decodeTokenClaims(token);
  if (exp !== null && exp * 1000 < Date.now()) {
    return NextResponse.json({ message: "انتهت جلسة لوحة التحرير. سجّل الدخول مرة أخرى." }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { url?: unknown } | null;
  if (typeof body?.url !== "string" || body.url.length > 2048) {
    return NextResponse.json({ message: "رابط فيسبوك غير صالح." }, { status: 400 });
  }

  let source: URL;
  try { source = new URL(body.url); }
  catch { return NextResponse.json({ message: "رابط فيسبوك غير صالح." }, { status: 400 }); }

  const path = source.pathname.replace(/\/$/, "");
  const isShareLink = ["facebook.com", "www.facebook.com", "m.facebook.com"].includes(source.hostname)
    && /^\/share\/(?:v|r)\/[\w.-]+$/.test(path);
  const isShortLink = source.hostname === "fb.watch" && /^\/[\w.-]+$/.test(path);
  if (source.protocol !== "https:" || source.username || source.password || source.port || source.hash
      || (!isShareLink && !isShortLink)) {
    return NextResponse.json({ message: "ألصق رابط مشاركة فيديو عام من Facebook أو fb.watch." }, { status: 400 });
  }

  try {
    const response = await fetch(source.toString(), {
      method: "HEAD",
      redirect: "manual",
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JusoorEmbedResolver/1.0)" },
      signal: AbortSignal.timeout(6000),
    });
    const location = response.headers.get("location");
    if (!location || response.status < 300 || response.status >= 400) {
      return NextResponse.json({ message: "لم يُرجع Facebook رابط فيديو مباشر. تأكد أن الفيديو عام وقابل للتضمين." }, { status: 422 });
    }

    const destination = new URL(location, source);
    const destinationPath = destination.pathname.replace(/\/$/, "");
    const isReel = /^\/reel\/\d{5,30}$/.test(destinationPath);
    const isVideo = /^\/(?:[^/]+\/)?videos\/\d{5,30}$/.test(destinationPath);
    const isWatch = destinationPath === "/watch" && /^\d{5,30}$/.test(destination.searchParams.get("v") ?? "");
    if (destination.protocol !== "https:" || !FACEBOOK_HOSTS.has(destination.hostname)
        || destination.username || destination.password || destination.port || destination.hash
        || (!isReel && !isVideo && !isWatch)) {
      return NextResponse.json({ message: "تعذّر العثور على رابط فيديو Facebook مباشر قابل للتضمين." }, { status: 422 });
    }

    destination.hostname = "www.facebook.com";
    destination.search = isWatch ? `?v=${encodeURIComponent(destination.searchParams.get("v") ?? "")}` : "";
    return NextResponse.json({ url: destination.toString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "تعذّر التحقق من رابط Facebook الآن. جرّب رابطًا مباشرًا لاحقًا." }, { status: 502 });
  }
}
