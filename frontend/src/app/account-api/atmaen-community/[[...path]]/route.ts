import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendUrl, forbiddenOrigin, isSameOrigin } from "@/lib/server/backend";

export const dynamic = "force-dynamic";
const USER_COOKIE = "jusoor_user_token";

async function proxy(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const writing = request.method !== "GET";
  if (writing && !isSameOrigin(request)) return forbiddenOrigin();
  const { path = [] } = await context.params;
  const safePath = path.map((part) => encodeURIComponent(decodeURIComponent(part))).join("/");
  const token = (await cookies()).get(USER_COOKIE)?.value;
  if (writing && !token) return NextResponse.json({ message: "سجّل الدخول للمشاركة في مجتمع الاطمئنان." }, { status: 401 });
  const body = writing ? await request.text() : undefined;
  const upstream = await fetch(backendUrl(`/api/v1/atmaen/community${safePath ? `/${safePath}` : ""}${new URL(request.url).search}`), {
    method: request.method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
    body,
    cache: "no-store",
  }).catch(() => null);
  if (!upstream) return NextResponse.json({ message: "تعذّر الاتصال بالخادم." }, { status: 502 });
  return new NextResponse(upstream.status === 204 ? null : await upstream.text(), { status: upstream.status, headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" } });
}

export { proxy as GET, proxy as POST };