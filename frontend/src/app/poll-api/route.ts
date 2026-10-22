import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { backendUrl, forbiddenOrigin, isSameOrigin } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

export async function GET() {
  const upstream = await fetch(backendUrl("/api/v1/homepage-polls/active"), { cache: "no-store" }).catch(() => null);
  if (!upstream) return NextResponse.json({ message: "تعذّر تحميل الاستبيان." }, { status: 502 });
  const response = new NextResponse(upstream.status === 404 ? null : await upstream.text(), { status: upstream.status, headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" } });
  if (!(await cookies()).has("jusoor_poll_voter")) response.cookies.set("jusoor_poll_voter", randomUUID() + randomUUID(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  const input = await request.json().catch(() => null) as { id?: string; optionIndex?: number } | null;
  if (!input?.id || !Number.isInteger(input.optionIndex)) return NextResponse.json({ message: "اختر إجابة واحدة." }, { status: 400 });
  const jar = await cookies();
  const voterKey = jar.get("jusoor_poll_voter")?.value ?? randomUUID() + randomUUID();
  const upstream = await fetch(backendUrl("/api/v1/homepage-polls/" + encodeURIComponent(input.id) + "/vote"), {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voterKey, optionIndex: input.optionIndex }), cache: "no-store",
  }).catch(() => null);
  if (!upstream) return NextResponse.json({ message: "تعذّر تسجيل مشاركتك." }, { status: 502 });
  const response = new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" } });
  if (!jar.has("jusoor_poll_voter")) response.cookies.set("jusoor_poll_voter", voterKey, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}
