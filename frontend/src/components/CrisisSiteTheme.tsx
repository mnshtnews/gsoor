"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Apply the active crisis palette across public pages, excluding the CMS workspace. */
export function CrisisSiteTheme({ active }: { active: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    const shouldApply = active && !pathname.startsWith("/cms");
    document.body.classList.toggle("crisis-mode-active", shouldApply);
    return () => document.body.classList.remove("crisis-mode-active");
  }, [active, pathname]);

  return null;
}
