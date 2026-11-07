import type { Metadata } from "next";
import CmsPermissionsManager from "@/components/cms/CmsPermissionsManager";

export const metadata: Metadata = {
  title: "صلاحيات المسؤولين والاستثناءات — غرفة أخبار جسور",
};

export default function CmsPermissionsPage() {
  return <CmsPermissionsManager />;
}
