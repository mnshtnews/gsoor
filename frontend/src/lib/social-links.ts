import type { PublicSocialLink } from "@/lib/news-api";

export const DEFAULT_PUBLIC_SOCIAL_LINKS: PublicSocialLink[] = [
  { id: "facebook", name: "فيسبوك", href: "https://www.facebook.com/jswr.gosour", icon: "facebook", isVisible: true },
  { id: "x", name: "X", href: "https://x.com/gosour22", icon: "x", isVisible: true },
  { id: "instagram", name: "إنستجرام", href: "https://www.instagram.com/gosour22/", icon: "instagram", isVisible: true },
  { id: "youtube", name: "يوتيوب", href: "", icon: "youtube", isVisible: false },
];

export const SOCIAL_ICON_PATHS: Record<string, string> = {
  facebook: "M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.66.34-1 1-1z",
  x: "M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.37l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2zm-1.1 17.7h1.73L8.27 4.2H6.42L17.8 19.7z",
  instagram: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.5-3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z",
  youtube: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6z",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 9h-3.1a15.7 15.7 0 0 0-1.3-5.2A8 8 0 0 1 18.9 11zM12 4c.9 1.2 1.6 3.7 1.8 7h-3.6c.2-3.3.9-5.8 1.8-7zM9.5 5.8A15.7 15.7 0 0 0 8.2 11H5.1a8 8 0 0 1 4.4-5.2zM5.1 13h3.1a15.7 15.7 0 0 0 1.3 5.2A8 8 0 0 1 5.1 13zm6.9 7c-.9-1.2-1.6-3.7-1.8-7h3.6c-.2 3.3-.9 5.8-1.8 7zm2.5-1.8a15.7 15.7 0 0 0 1.3-5.2h3.1a8 8 0 0 1-4.4 5.2z",
  linkedin: "M5.2 3a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM3.4 9h3.7v12H3.4zm5.9 0h3.5v1.6h.1A3.9 3.9 0 0 1 16.4 8c3.8 0 4.5 2.5 4.5 5.7V21h-3.7v-6.5c0-1.6 0-3.6-2.2-3.6s-2.5 1.7-2.5 3.5V21H9.3z",
  tiktok: "M19.6 6.2a5.5 5.5 0 0 1-3.4-3.4V2h-3.7v13.1a2.7 2.7 0 1 1-2.7-2.7c.4 0 .8.1 1.1.2V8.8a6.4 6.4 0 1 0 5.3 6.3V9a9.1 9.1 0 0 0 4.7 1.3V6.6c-.5 0-.9-.1-1.3-.4z",
};

export function socialIconPath(icon: string): string {
  return SOCIAL_ICON_PATHS[icon] ?? SOCIAL_ICON_PATHS.globe;
}
