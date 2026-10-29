import Link from "next/link";
import CrisisAlertAudio from "@/components/CrisisAlertAudio";
import { CrisisAccountActions } from "@/components/CrisisAccountActions";
import type { PublicCrisisMode } from "@/lib/news-api";

export function CrisisStatusBar({ crisis }: { crisis: PublicCrisisMode | null }) {
  if (!crisis?.isActive) return null;
  const severity = crisis.severity === "emergency" ? "طوارئ" : crisis.severity === "advisory" ? "تنبيه" : "عاجل";
  return <aside className={`crisis-bar crisis-bar--${crisis.severity}`} role="status" aria-label={`تنبيه أزمة نشطة: ${severity}`}>
      <div className="crisis-bar__inner"><span className="crisis-bar__badge"><i className="crisis-bar__dot" aria-hidden="true" />{severity}</span>
        <p className="crisis-bar__text"><strong>{crisis.title}</strong><span> — {crisis.summary}</span></p>
        <div className={`crisis-bar__actions${crisis.soundUrl ? "" : " crisis-bar__actions--no-audio"}`}>{crisis.soundUrl && <CrisisAlertAudio src={crisis.soundUrl} repeatSeconds={crisis.soundRepeatIntervalSeconds} />}<Link className="crisis-bar__cta" href="/crisis">مركز الأزمة</Link><CrisisAccountActions /></div>
      </div>
    </aside>;
}
