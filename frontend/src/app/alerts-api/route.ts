import { NextResponse } from "next/server";
import { backendUrl, forbiddenOrigin, isSameOrigin } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

export async function GET() {
  const upstream = await fetch(backendUrl("/api/v1/alert-subscriptions/status"), { cache: "no-store" }).catch(() => null);
  if (!upstream) return NextResponse.json({ message: "تعذّر الاتصال بخدمة التنبيهات." }, { status: 502 });
  return new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" } });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== "string" || typeof body.consent !== "boolean")
    return NextResponse.json({ message: "أدخل بريدك ووافق على استخدامه للتنبيهات." }, { status: 400 });
  const upstream = await fetch(backendUrl("/api/v1/alert-subscriptions"), {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store",
  }).catch(() => null);
  if (!upstream) return NextResponse.json({ message: "تعذّر الاتصال بخدمة التنبيهات. حاول مرة أخرى." }, { status: 502 });
  return new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" } });
}
