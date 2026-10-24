import { LocalizedContent } from "@/components/LocalizedContent";
import { ArticleEditor } from "@/components/cms/ArticleEditor";

export default async function CmsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LocalizedContent>{<ArticleEditor articleId={id === "new" ? null : id} />}</LocalizedContent>;
}
