import type { Metadata } from "next";
import { AtmaenCommunityFeed } from "@/components/AtmaenCommunityFeed";

export const metadata: Metadata = {
  title: "مجتمع الاطمئنان | جسور",
  description: "تحديثات عامة يشاركها مجتمع المصريين بالخارج للاطمئنان والتواصل الإنساني.",
  robots: { index: false, follow: true },
};

export default function AtmaenCommunityPage() {
  return <AtmaenCommunityFeed />;
}