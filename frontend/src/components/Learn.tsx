import { ArrowRight, BookOpenCheck, CheckCircle2, ClipboardCheck, Crosshair, GraduationCap, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

const modules = [
  { number: '01', title: 'Read the pressure', duration: '6 min', description: 'Spot fear, urgency, secrecy and rewards — the social-engineering levers behind most scam messages.', outcomes: ['Urgency vs real deadlines', 'Why authority cues work'] },
  { number: '02', title: 'Inspect without clicking', duration: '8 min', description: 'Learn a safe routine for URLs, QR codes, sender names and payment requests before you interact.', outcomes: ['Domain anatomy', 'QR and shortened-link checks'] },
  { number: '03', title: 'Respond and preserve', duration: '7 min', description: 'Practise what to do after contact: stop, secure, document, escalate and support someone without blame.', outcomes: ['Evidence basics', 'Official escalation routes'] },
];

export default function Learn({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return <div className="mx-auto max-w-[1180px]">
    <section className="learn-hero scroll-reveal">
      <div><p className="eyebrow">Cybersecurity fundamentals, made local</p><h1>Build judgement,<br /><span>not just answers.</span></h1><p>Short, practical lessons for Malaysian students — designed to help you protect yourself, your family, and your campus community.</p></div>
      <div className="lesson-promise"><ShieldCheck className="h-7 w-7" /><div><strong>Learn safely</strong><span>Realistic examples. No live malicious links.</span></div></div>
    </section>

    <section className="mt-6 grid gap-4 lg:grid-cols-3">
      {modules.map(module => <article key={module.number} className="lesson-card scroll-reveal"><div className="flex justify-between"><span className="lesson-number">{module.number}</span><span className="pill">{module.duration}</span></div><h2>{module.title}</h2><p>{module.description}</p><ul>{module.outcomes.map(outcome => <li key={outcome}><CheckCircle2 className="h-4 w-4" />{outcome}</li>)}</ul></article>)}
    </section>

    <section className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <div className="terminal-panel scroll-reveal p-6">
        <p className="eyebrow">Your 20-second habit</p><h2 className="mt-1 text-2xl font-black text-white">Pause · Verify · Protect</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Habit icon={<Crosshair className="h-5 w-5" />} title="Pause" text="Do not rush. A real organisation can wait while you verify." />
          <Habit icon={<ClipboardCheck className="h-5 w-5" />} title="Verify" text="Use an official app, saved number or trusted URL — not the message link." />
          <Habit icon={<BookOpenCheck className="h-5 w-5" />} title="Protect" text="Keep OTPs and passwords private; turn on MFA and tell someone you trust." />
        </div>
      </div>
      <div className="campus-callout scroll-reveal"><GraduationCap className="h-8 w-8" /><h2>Put it into practice</h2><p>Take the Campus “Spot the Phish” drill for feedback on genuine-looking scenarios, then help organise a peer learning session.</p><button onClick={() => onNavigate('cybersquad')} className="button-primary mt-4 min-h-11 px-4 text-xs">Open Campus lab <ArrowRight className="h-4 w-4" /></button></div>
    </section>

    <section className="mt-5 terminal-panel scroll-reveal p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="eyebrow">Want to investigate more deeply?</p><h2 className="mt-1 text-xl font-black text-white">Explore the practice scenario library</h2></div><button onClick={() => onNavigate('threats')} className="button-ghost min-h-10 px-4 text-xs">Browse scenarios <ArrowRight className="h-4 w-4" /></button></div></section>
  </div>;
}

function Habit({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="rounded-lg border border-[var(--line-dim)] bg-black/25 p-4"><div className="text-[var(--amber)]">{icon}</div><h3 className="mt-3 font-bold text-white">{title}</h3><p className="mt-1 text-sm leading-5 text-[var(--muted)]">{text}</p></div>; }
