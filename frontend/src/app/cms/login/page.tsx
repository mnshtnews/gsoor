import { redirect } from "next/navigation";

export default async function LegacyCmsLoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const { returnTo } = await searchParams;
  const safeReturn = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/cms";
  redirect("/auth?returnTo=" + encodeURIComponent(safeReturn));
}
