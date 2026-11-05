"use client";

import { useEffect } from "react";

/** Reports one read of this article to the "most read" counter (once per visitor per day). */
export function ArticleViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetch("/api/article-views", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: articleId }), keepalive: true }).catch(() => undefined);
    }, 4000); // a real read, not an instant bounce
    return () => window.clearTimeout(timer);
  }, [articleId]);
  return null;
}
