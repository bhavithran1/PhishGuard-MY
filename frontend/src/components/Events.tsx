import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Lightbulb,
  Mail,
  MapPin,
  Presentation,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';

// PLACEHOLDER — replace with your student team's real contact address before launch.
const CONTACT_EMAIL = 'phishguard.students@example.com';
const INTEREST_MAILTO =
  `mailto:${CONTACT_EMAIL}` +
  '?subject=PhishGuard%20MY%20—%20Workshop%20/%20Hackathon%20interest' +
  '&body=Hi%20PhishGuard%20team%2C%0A%0AI%27d%20like%20to%20(host%20a%20workshop%20/%20join%20a%20hackathon%20/%20help%20run%20an%20event).%0A%0ACampus%3A%20%0ARough%20group%20size%3A%20%0APreferred%20dates%3A%20%0A%0AThanks!';

const sampleEvents = [
  {
    icon: Presentation,
    kind: 'Workshop',
    title: 'Spot-the-Scam Campus Workshop',
    when: 'Sample — date to be announced',
    venue: 'Your campus (lecture hall or lab)',
    blurb:
      'A 60–90 minute hands-on session where students learn the four scam signals and practise with the live Analyzer and Spot-the-Phish drill.',
  },
  {
    icon: Users,
    kind: 'Meetup',
    title: 'Student Safety Circle',
    when: 'Sample — dates to be announced',
    venue: 'Hybrid — campus room + online',
    blurb:
      'An informal peer meetup to swap the latest scam texts going around, review the scenario library together, and plan awareness activities.',
  },
  {
    icon: Rocket,
    kind: 'Hackathon',
    title: 'PhishGuard Student Hackathon',
    when: 'Sample — dates to be announced',
    venue: 'To be confirmed',
    blurb:
      'A one-day build sprint where student teams design awareness tools and safer-by-default ideas to help their communities resist scams.',
  },
];

const agenda = [
  { time: '0–10 min', title: 'Warm-up', text: 'Quick show of hands: “Who has had a suspicious text this month?” Share one redacted example to set the tone. No judgement.' },
  { time: '10–25 min', title: 'The four signals', text: 'Walk through urgency, impersonation, payment pressure, and “too good to be true” using the Learn module as your slides.' },
  { time: '25–45 min', title: 'Live Analyzer demo', text: 'Paste the built-in practice examples into the Analyzer on screen and discuss the signals it highlights. Never use real malicious links.' },
  { time: '45–65 min', title: 'Spot-the-Phish teams', text: 'Split into small teams and run the Campus challenge or scenario library. Award a small prize for the sharpest team.' },
  { time: '65–80 min', title: 'If it happens to you', text: 'Cover Pause · Verify · Protect and the official channels: your bank, NSRC 997, Cyber999, and PDRM Semak Mule.' },
  { time: '80–90 min', title: 'Pledge & wrap', text: 'Everyone texts one family member a single safety tip before they leave. Share the site link so people can keep the tools.' },
];

const facilitationTips = [
  'Keep it blame-free — anyone can be targeted, and shame keeps victims silent.',
  'Use local, familiar examples: parcel texts, fake jobs, e-wallet “cashback”, account alerts.',
  'Never display or click a real malicious link. Stick to the site’s built-in practice samples.',
  'Do not collect anyone’s personal details, passwords, OTP/TAC, PIN, or card numbers — not even for a demo.',
];

const prepChecklist = [
  { icon: Presentation, text: 'A laptop and projector with this site open. It also works offline, so patchy campus Wi-Fi is fine.' },
  { icon: ClipboardList, text: 'A printed one-page cheat sheet of the four signals and the Pause · Verify · Protect habit.' },
  { icon: ShieldCheck, text: 'The official helpline numbers written large: NSRC 997, Cyber999 1-300-88-2999, and Semak Mule.' },
  { icon: Users, text: 'A room that fits small groups, plus a small prize to make the Spot-the-Phish round fun.' },
];

const hackathonThemes = [
  'Scam-awareness tools built for students and families',
  'Making security education accessible (languages, low-data, offline)',
  'Recognising Malaysia-specific scam patterns and local red flags',
  'Helping people pause and verify before they act on a message',
];

const judgingCriteria = [
  { label: 'Real-world impact', text: 'Would this genuinely help someone avoid a scam?' },
  { label: 'Originality', text: 'A fresh angle rather than a copy of an existing app.' },
  { label: 'Craft & execution', text: 'How complete, usable, and polished the build is.' },
  { label: 'Safety by design', text: 'No dark patterns; never asks for passwords, OTP/TAC, or card details.' },
  { label: 'Communication', text: 'A clear demo that a non-technical audience can follow.' },
];

export default function Events({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="mx-auto max-w-[1180px]">
      <section className="learn-hero scroll-reveal">
        <div>
          <p className="eyebrow">By students, for students</p>
          <h1>Bring the movement<br /><span>to your campus.</span></h1>
          <p>
            Workshops, meetups, and hackathons run by students to help their peers spot scams early. Host one, join one, or
            help us run the next.
          </p>
        </div>
        <div className="lesson-promise">
          <CalendarDays className="h-7 w-7" />
          <div><strong>Student-led events</strong><span>Free to run. Built on the tools you already see here.</span></div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">On the horizon</p>
            <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Upcoming events</h2>
          </div>
          <span className="pill px-2.5 py-1 text-[0.68rem]">Sample line-up · not yet scheduled</span>
        </div>
        <div className="events-grid">
          {sampleEvents.map(event => (
            <article key={event.title} className="event-card scroll-reveal">
              <div className="event-card-head">
                <span className="event-icon"><event.icon className="h-5 w-5" /></span>
                <span className="event-kind">{event.kind}</span>
              </div>
              <h3>{event.title}</h3>
              <p className="event-meta"><CalendarDays className="h-3.5 w-3.5" /> {event.when}</p>
              <p className="event-meta"><MapPin className="h-3.5 w-3.5" /> {event.venue}</p>
              <p className="event-blurb">{event.blurb}</p>
              <span className="event-sample">Sample — dates to be announced</span>
            </article>
          ))}
        </div>
      </section>

      <section className="starter-kit scroll-reveal mt-6">
        <div className="starter-kit-head">
          <div>
            <p className="eyebrow">Host a workshop at your school</p>
            <h2>A ready-to-run starter kit</h2>
            <p>
              You do not need to be an expert. This 60–90 minute plan turns the Analyzer, Spot-the-Phish drill, and scenario
              library into activities your classmates will remember.
            </p>
          </div>
          <div className="starter-kit-actions">
            <button onClick={() => onNavigate('analyzer')} className="button-ghost min-h-11 px-4 text-xs">Open the Analyzer <ArrowRight className="h-4 w-4" /></button>
            <button onClick={() => onNavigate('cybersquad')} className="button-ghost min-h-11 px-4 text-xs">Open Spot-the-Phish <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="agenda-header"><Clock className="h-4 w-4" /> Suggested 60–90 minute agenda</div>
        <ol className="agenda-list">
          {agenda.map((item, i) => (
            <li key={item.title} className="agenda-item">
              <span className="agenda-step">{i + 1}</span>
              <div>
                <div className="agenda-item-head">
                  <h4>{item.title}</h4>
                  <span className="agenda-time">{item.time}</span>
                </div>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="starter-kit-grid">
          <div className="starter-kit-panel">
            <h3><Lightbulb className="h-4 w-4" /> Facilitation tips</h3>
            <ul className="check-list">
              {facilitationTips.map(tip => (
                <li key={tip}><CheckCircle2 className="h-4 w-4" /> {tip}</li>
              ))}
            </ul>
          </div>
          <div className="starter-kit-panel">
            <h3><Wrench className="h-4 w-4" /> What to prepare</h3>
            <ul className="prep-list">
              {prepChecklist.map(item => (
                <li key={item.text}><span className="prep-icon"><item.icon className="h-4 w-4" /></span> {item.text}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="hackathon-band scroll-reveal mt-6">
        <div className="hackathon-intro">
          <span className="hackathon-badge"><Rocket className="h-3.5 w-3.5" /> Hackathon format</span>
          <h2>Build something that keeps people safe</h2>
          <p>
            A student cybersecurity hackathon is a friendly build sprint — usually one day, or a weekend. Teams of
            <strong> 2 to 4 </strong> design and demo an idea that helps their community resist scams. It rewards empathy and
            clarity as much as code, so designers, writers, and first-timers all belong on a team.
          </p>
          <div className="hackathon-facts">
            <div><Users className="h-4 w-4" /><strong>2–4</strong><span>per team</span></div>
            <div><Clock className="h-4 w-4" /><strong>1 day</strong><span>or a weekend</span></div>
            <div><Sparkles className="h-4 w-4" /><strong>All levels</strong><span>beginners welcome</span></div>
          </div>
        </div>

        <div className="hackathon-cols">
          <div className="hackathon-panel">
            <h3><Lightbulb className="h-4 w-4" /> Theme ideas</h3>
            <ul className="check-list">
              {hackathonThemes.map(theme => (
                <li key={theme}><CheckCircle2 className="h-4 w-4" /> {theme}</li>
              ))}
            </ul>
          </div>
          <div className="hackathon-panel">
            <h3><Trophy className="h-4 w-4" /> Judging criteria ideas</h3>
            <ul className="criteria-list">
              {judgingCriteria.map(c => (
                <li key={c.label}><strong>{c.label}</strong><span>{c.text}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <p className="hackathon-note">
          Prizes and exact rules are illustrative — a sample format to adapt for your own campus event, not a scheduled
          competition.
        </p>
      </section>

      <section className="events-cta scroll-reveal mt-6">
        <div>
          <p className="eyebrow">Want in?</p>
          <h2>Host, join, or help run the next one</h2>
          <p>
            Tell us your campus and rough group size and we will share the starter kit and next steps. No sign-up forms and no
            personal details needed — a short email is enough.
          </p>
        </div>
        <div className="events-cta-actions">
          <a href={INTEREST_MAILTO} className="button-primary min-h-12 px-5 text-sm">
            <Mail className="h-4 w-4" /> Email the team
          </a>
          <button onClick={() => onNavigate('learn')} className="button-ghost min-h-12 px-5 text-sm">
            Preview the material <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
        <p className="events-cta-note">
          Placeholder contact: <span className="mono">{CONTACT_EMAIL}</span>. PhishGuard MY is a student learning project — it
          is not a bank, law-enforcement service, or official reporting channel. Never share passwords, OTPs, TACs, PINs, or
          card details at any event.
        </p>
      </section>
    </div>
  );
}
