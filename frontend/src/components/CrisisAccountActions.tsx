"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionSnapshot = { authenticated?: boolean; roles?: string[]; staff?: boolean };

/** Mobile account actions placed beside the crisis alert controls. */
export function CrisisAccountActions() {
  const [signedIn, setSignedIn] = useState(false);
  const [staff, setStaff] = useState(false);

  useEffect(() => {
    let active = true;
    const syncSession = () => {
      fetch("/account-api/session", { cache: "no-store" })
        .then(async (response) => response.ok ? response.json() as Promise<SessionSnapshot> : null)
        .then((session) => {
          if (!active) return;
          setSignedIn(!!session?.authenticated);
          setStaff(!!session?.staff && (session.roles?.length ?? 0) > 0);
        })
        .catch(() => {
          if (!active) return;
          setSignedIn(false);
          setStaff(false);
        });
    };

    syncSession();
    window.addEventListener("jusoor:session-change", syncSession);
    return () => {
      active = false;
      window.removeEventListener("jusoor:session-change", syncSession);
    };
  }, []);

  const singleAction = signedIn;
  return <div className={`crisis-bar__account auth-group${singleAction ? " crisis-bar__account--single" : " crisis-bar__account--guest"}`} aria-label="حسابك">
    {staff ? <Link href="/cms" className="btn-nav btn-ghostt">لوحة التحرير</Link>
      : signedIn ? <Link href="/auth" className="btn-nav btn-ghostt">صفحتي</Link>
      : <><Link href="/auth?tab=login" className="btn-nav btn-ghostt">دخول</Link><Link href="/auth?tab=signup" className="btn-nav btn-accent">إنشاء حساب</Link></>}
  </div>;
}
