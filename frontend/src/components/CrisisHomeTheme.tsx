"use client";

import { useEffect } from "react";

export function CrisisHomeTheme() {
  useEffect(() => {
    document.body.classList.add("crisis-mode-active");
    return () => document.body.classList.remove("crisis-mode-active");
  }, []);
  return null;
}
