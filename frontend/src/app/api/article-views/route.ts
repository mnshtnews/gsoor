import { NextResponse, type NextRequest } from "next/server";
import { isArticleId, recordArticleView } from "@/lib/server/article-views";

export const dynamic = "force-dynamic";

const COOKIE = "jusoor_viewed";
const MAX_REMEMBERED = 40;

/**
 * Counts one read per visitor per article per day. The visitor's recent article ids live in a
 * short-lived cookie so reloading the page does not inflate the "most read" ranking.
 */
export async function POST(request: NextRequest) {
  let id: unknown;
  try { id = ((await request.json()) as { id?: unknown })?.id; } catch { id = undefined; }
  if (!isArticleId(id)) return NextResponse.json({ counted: false }, { status: 400 });

  const seen = (request.cookies.get(COOKIE)?.value ?? "").split(".").filter(Boolean);
  const short = id.replace(/-/g, "").toLowerCase();
  if (seen.includes(short)) return NextResponse.json({ counted: false });

  await recordArticleView(id);
  const response = NextResponse.json({ counted: true });
  response.cookies.set(COOKIE, [short, ...seen].slice(0, MAX_REMEMBERED).join("."), { maxAge: 60 * 60 * 24, path: "/", sameSite: "lax", httpOnly: true, secure: request.nextUrl.protocol === "https:" });
  return response;
}
