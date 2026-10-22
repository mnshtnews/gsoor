import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AccountPortal } from "@/components/AccountPortal";

export const metadata: Metadata = { title: "الدخول وإنشاء حساب | جسور", description: "سجّل الدخول أو أنشئ حسابًا للوصول إلى خدمات منصة جسور للمصريين بالخارج." };

export default function AccountPage() {
  return <main id="main" className="account-page">
    <div className="auth-shell">
      <aside className="auth-visual">
        <div>
          <Link href="/" className="auth-visual-brand" aria-label="العودة إلى جسور">
            <Image src="/assets/josour-logo-transparent.png" alt="جسور" width={1104} height={974} priority />
            <span>المصريون بالخارج سفراء الوطن</span>
          </Link>
          <h2>أخبارك وخدماتك وشبكة اطمئنان أسرتك — <span className="auth-visual-nowrap">في مكان واحد.</span></h2>
        </div>
        <p className="quote">تابع ما يهمك من أخبار المصريين بالخارج، واستفد من خدمات جسور أينما كنت.</p>
      </aside>
      <section className="auth-form-side">
        <AccountPortal />
        <div className="auth-panel-bottom"><Link href="/">تصفّح الموقع كزائر <span aria-hidden="true">←</span></Link></div>
      </section>
    </div>
  </main>;
}
