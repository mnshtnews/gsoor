import { getPublicCrisisMode } from "@/lib/news-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    return Response.json(await getPublicCrisisMode(), { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch {
    return Response.json({ isActive: false }, { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } });
  }
}
