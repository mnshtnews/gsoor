"use client";

import { useEffect, useState } from "react";

type Poll = { id: string; question: string; options: { text: string; votes: number }[]; isOpen: boolean; totalVotes: number };

export function HomepagePollWidget() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/poll-api", { cache: "no-store" }).then(async (response) => response.ok ? response.json() as Promise<Poll> : null)
      .then((value) => { if (!value) return; setPoll(value); setVoted(localStorage.getItem("jusoor_home_poll_voted_" + value.id) === "1"); })
      .catch(() => setPoll(null));
  }, []);
  async function vote() {
    if (!poll || choice === null) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/poll-api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: poll.id, optionIndex: choice }) });
      const data = await response.json().catch(() => ({})) as Poll & { message?: string };
      if (!response.ok) { if (response.status === 409 && data.options) { setPoll(data); setVoted(true); } else setMessage(data.message ?? "تعذّر تسجيل التصويت."); }
      else { setPoll(data); setVoted(true); localStorage.setItem("jusoor_home_poll_voted_" + poll.id, "1"); setMessage("شكرًا لمشاركتك."); }
    } catch { setMessage("تعذّر الاتصال. حاول مجددًا."); }
    finally { setBusy(false); }
  }
  if (!poll) return null;
  return <section className="home-poll-section section tight"><div className="wrap"><div className="home-poll-card">
    <div className="home-poll-heading"><span className="eyebrow">صوتك يهمنا</span><h2>استبيان جسور</h2><p>شاركنا رأيك في سؤال يهم المصريين بالخارج.</p></div>
    <div className="home-poll-content"><h3>{poll.question}</h3><div className="home-poll-options">
      {poll.options.map((option, index) => {
        const percent = poll.totalVotes ? Math.round(option.votes * 100 / poll.totalVotes) : 0;
        return <label className={"home-poll-option" + (choice === index ? " is-selected" : "")} key={option.text}>
          <input type="radio" name={"poll-" + poll.id} checked={choice === index} onChange={() => setChoice(index)} disabled={voted || !poll.isOpen} />
          <span className="home-poll-option-label">{option.text}</span>
          {(voted || !poll.isOpen) && <span className="home-poll-result"><i style={{ width: percent + "%" }} /><b>{percent}%</b></span>}
        </label>;
      })}
    </div>
    {!voted && poll.isOpen && <button className="btn btn-primary home-poll-submit" type="button" disabled={busy || choice === null} onClick={() => void vote()}>{busy ? "جارٍ تسجيل صوتك…" : "شارك في الاستبيان"}</button>}
    {!poll.isOpen && <p className="home-poll-closed">انتهى التصويت في هذا الاستبيان.</p>}
    {voted && <p className="home-poll-thanks">إجمالي المشاركات: {poll.totalVotes.toLocaleString("ar-EG")}</p>}
    {message && <p className="home-poll-message" role="status">{message}</p>}
    </div>
  </div></div></section>;
}
