import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendUrl, CMS_COOKIE, decodeTokenClaims, forbiddenOrigin, isSameOrigin } from "@/lib/server/backend";

export const dynamic = "force-dynamic";
const USER_COOKIE = "jusoor_user_token";
const STAFF_ROLES = ["Reporter", "AiEditor", "CopyEditor", "SeniorEditor", "ManagingEditor", "EditorInChief", "SystemAdmin", "SeoEditor", "FactChecker", "Researcher", "CrisisEditor"];

export async function GET() {
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value ?? jar.get(CMS_COOKIE)?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });
  const response = await fetch(backendUrl("/api/v1/profile"), { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }).catch(() => null);
  if (!response) return NextResponse.json({ message: "تعذّر الاتصال بالخادم." }, { status: 502 });
  if (!response.ok) return NextResponse.json({ authenticated: false }, { status: response.status });
  const { roles } = decodeTokenClaims(token);
  return NextResponse.json({ authenticated: true, profile: await response.json(), roles, staff: roles.some((role) => STAFF_ROLES.includes(role)) });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  const body = await request.json().catch(() => null) as { action?: string; email?: string; password?: string; displayName?: string } | null;
  if (!body || !["login", "register"].includes(body.action ?? "") || !body.email || !body.password || (body.action === "register" && !body.displayName?.trim())) {
    return NextResponse.json({ message: "أكمل بيانات الحساب المطلوبة." }, { status: 400 });
  }
  const upstream = await fetch(backendUrl(`/api/v1/auth/${body.action}`), {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body.action === "register" ? { email: body.email, password: body.password, displayName: body.displayName } : { email: body.email, password: body.password }),
    cache: "no-store",
  }).catch(() => null);
  if (!upstream) return NextResponse.json({ message: "تعذّر الاتصال بالخادم." }, { status: 502 });
  const result = await upstream.json().catch(() => ({})) as { accessToken?: string; expiresAtUtc?: string; message?: string; errors?: string[] };
  if (!upstream.ok || !result.accessToken || !result.expiresAtUtc) {
    const message = result.errors?.join(" ") || (body.action === "login" ? "تعذّر تسجيل الدخول. راجع البيانات وحاول مجددًا." : "تعذّر إنشاء الحساب. راجع البيانات وحاول مجددًا.");
    return NextResponse.json({ message }, { status: upstream.status });
  }
  const maxAge = Math.max(60, Math.floor((new Date(result.expiresAtUtc).getTime() - Date.now()) / 1000));
  const { roles } = decodeTokenClaims(result.accessToken);
  const staff = roles.some((role) => STAFF_ROLES.includes(role));
  const response = NextResponse.json({ ok: true, staff });
  response.cookies.set(USER_COOKIE, result.accessToken, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "true", path: "/", maxAge });
  if (staff) response.cookies.set(CMS_COOKIE, result.accessToken, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "true", path: "/", maxAge });
  else response.cookies.delete(CMS_COOKIE);
  return response;
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(USER_COOKIE);
  response.cookies.delete(CMS_COOKIE);
  return response;
}
