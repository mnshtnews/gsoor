import { permanentRedirect } from "next/navigation";

/** Collapse existing long /article/{id}/{encoded-title} links onto the short canonical URL. */
export default async function LegacyArticleSlugRoute({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id } = await params;
  permanentRedirect(`/article/${encodeURIComponent(id)}`);
}
