import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CMS_COOKIE, backendUrl, forbiddenOrigin, isSameOrigin } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

// In-memory persistent map across requests for the server instance
const memoryOverrides = new Map<string, Record<string, "grant" | "revoke">>();

const NATIVE_BACKEND_PERMS: Record<string, string> = {
  "Users.View": "Users.View",
  "Users.Create": "Users.Create",
  "Users.ManageRoles": "Users.ManageRoles",
};

export async function GET(request: Request) {
  const token = (await cookies()).get(CMS_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    const all: Record<string, Record<string, "grant" | "revoke">> = {};
    for (const [uid, map] of memoryOverrides.entries()) {
      all[uid] = map;
    }
    return NextResponse.json({ overrides: all });
  }

  // Fetch native backend direct permissions for this user to keep them in sync
  const upstream = await fetch(backendUrl(`/api/v1/admin/users/${encodeURIComponent(userId)}/permissions`), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);

  const userOverrides = { ...(memoryOverrides.get(userId) || {}) };

  if (upstream && upstream.ok) {
    const data = (await upstream.json().catch(() => ({}))) as { granted?: string[] };
    if (Array.isArray(data.granted)) {
      for (const p of data.granted) {
        if (NATIVE_BACKEND_PERMS[p] && !userOverrides[p]) {
          userOverrides[p] = "grant";
        }
      }
    }
  }

  return NextResponse.json({ userId, overrides: userOverrides });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  const token = (await cookies()).get(CMS_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    userId?: string;
    overrides?: Record<string, "grant" | "revoke">;
  } | null;

  if (!body?.userId || typeof body.overrides !== "object") {
    return NextResponse.json({ message: "userId and overrides are required." }, { status: 400 });
  }

  const { userId, overrides } = body;
  memoryOverrides.set(userId, overrides);

  // Sync native permissions to backend in parallel
  const nativeSyncPromises = Object.keys(NATIVE_BACKEND_PERMS).map(async (perm) => {
    const state = overrides[perm];
    if (state === "grant") {
      await fetch(backendUrl(`/api/v1/admin/users/${encodeURIComponent(userId)}/permissions`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permission: perm }),
      }).catch(() => null);
    } else if (state === "revoke") {
      await fetch(
        backendUrl(`/api/v1/admin/users/${encodeURIComponent(userId)}/permissions/${encodeURIComponent(perm)}`),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch(() => null);
    }
  });

  await Promise.all(nativeSyncPromises);

  return NextResponse.json({ success: true, userId, overrides });
}
