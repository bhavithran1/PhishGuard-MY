import { useState } from 'react';
import { ArrowRight, BookOpenCheck, CheckCircle2, ClipboardCheck, Crosshair, GraduationCap, PlayCircle, ShieldCheck, X } from 'lucide-react';
import type { ReactNode } from 'react';

const modules = [
  { number: '01', title: 'Read the pressure', duration: '6 min', description: 'Spot fear, urgency, secrecy and rewards — the social-engineering levers behind most scam messages.', outcomes: ['Urgency vs real deadlines', 'Why authority cues work'], lesson: ['Notice the emotion the message wants you to feel.', 'Name the action it is pushing you to take.', 'Pause and verify through a channel you already trust.'] },
  { number: '02', title: 'Inspect without clicking', duration: '8 min', description: 'Learn a safe routine for URLs, QR codes, sender names and payment requests before you interact.', outcomes: ['Domain anatomy', 'QR and shortened-link checks'], lesson: ['Read the domain from right to left.', 'Treat shortened links and QR codes as hidden destinations.', 'Open the official app yourself instead of following the message.'] },
  { number: '03', title: 'Respond and preserve', duration: '7 min', description: 'Practise what to do after contact: stop, secure, document, escalate and support someone without blame.', outcomes: ['Evidence basics', 'Official escalation routes'], lesson: ['Stop contact and do not send more money.', 'Save messages, usernames, URLs and transaction details.', 'Use your bank, NSRC 997 or Cyber999 as appropriate.'] },
];

export default function Learn({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [activeNumber, setActiveNumber] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const activeModule = modules.find(module => module.number === activeNumber);
  const progress = Math.round((completed.length / modules.length) * 100);

  return <div className="mx-auto max-w-[1180px]">
    <section className="learn-hero scroll-reveal">
      <div><p className="eyebrow">Cybersecurity fundamentals, made local</p><h1>Build judgement,<br /><span>not just answers.</span></h1><p>Short, practical lessons for Malaysian students — designed to help you protect yourself, your family, and your campus community.</p></div>
      <div className="lesson-promise"><ShieldCheck className="h-7 w-7" /><div><strong>Learn safely</strong><span>Realistic examples. No live malicious links.</span></div></div>
    </section>

    <section className="learning-progress scroll-reveal" aria-label={`${progress}% of lessons completed`}><div><span>Your learning path</span><strong>{completed.length} of {modules.length} complete</strong></div><div><span style={{ width: `${progress}%` }} /></div></section>

    <section className="mt-6 grid gap-4 lg:grid-cols-3">
      {modules.map(module => <article key={module.number} className={`lesson-card scroll-reveal ${completed.includes(module.number) ? 'completed' : ''}`}><div className="flex justify-between"><span className="lesson-number">{completed.includes(module.number) ? 'Done' : module.number}</span><span className="pill">{module.duration}</span></div><h2>{module.title}</h2><p>{module.description}</p><ul>{module.outcomes.map(outcome => <li key={outcome}><CheckCircle2 className="h-4 w-4" />{outcome}</li>)}</ul><button onClick={() => setActiveNumber(module.number)} className="lesson-start">{completed.includes(module.number) ? 'Review lesson' : 'Start lesson'} <PlayCircle className="h-4 w-4" /></button></article>)}
    </section>

    {activeModule && <section className="lesson-workshop animate-slide-up" aria-live="polite"><div className="lesson-workshop-head"><div><span className="eyebrow">Lesson {activeModule.number} · {activeModule.duration}</span><h2>{activeModule.title}</h2></div><button aria-label="Close lesson" onClick={() => setActiveNumber(null)}><X className="h-5 w-5" /></button></div><div className="lesson-steps">{activeModule.lesson.map((step, index) => <div key={step}><span>{index + 1}</span><p>{step}</p></div>)}</div><div className="lesson-workshop-action"><p>Try saying the three steps out loud. If you can explain them to a friend, you have learned them.</p><button onClick={() => { setCompleted(current => current.includes(activeModule.number) ? current : [...current, activeModule.number]); setActiveNumber(null); }} className="button-primary min-h-11 px-4 text-sm"><CheckCircle2 className="h-4 w-4" /> Mark complete</button></div></section>}

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
