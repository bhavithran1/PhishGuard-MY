import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bug,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Globe2,
  Link2,
  Mail,
  MessageSquare,
  Phone,
  QrCode,
  Radar,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { api } from '../api';
import type { ContributionRequest, ReportResponse } from '../api';

type ReportRoute = 'signal' | 'urgent' | 'vulnerability';
type Channel = ContributionRequest['type'];
type IncidentType = ContributionRequest['incident_type'];

const CYBER999_FORM = 'https://www.mycert.org.my/portal/online-form?id=7a911418-9e84-4e48-84d3-aa8a4fe55f16';
const CYBER999_OVERVIEW = 'https://www.cybersecurity.my/portal-main/services/cyber999-overview';
const NSRC_GUIDE = 'https://nfcc.jpm.gov.my/index.php/en/about-nsrc';
const CVD_GUIDE = 'https://www.mycert.org.my/portal/full?id=6ccc6fe0-f16e-4979-8bd4-17a25205ee1c';

const routeOptions: Array<{
  id: ReportRoute;
  title: string;
  description: string;
  destination: string;
  icon: typeof Radar;
}> = [
  {
    id: 'signal',
    title: 'New scam or phishing',
    description: 'No money was lost. Package a new tactic, sender, link or message for Cyber999.',
    destination: 'Cyber999 / MyCERT',
    icon: Radar,
  },
  {
    id: 'urgent',
    title: 'Money or account affected',
    description: 'Call your bank and NSRC first. Then preserve a clear chronology and evidence.',
    destination: 'Bank + NSRC 997',
    icon: ShieldAlert,
  },
  {
    id: 'vulnerability',
    title: 'Software vulnerability',
    description: 'Use coordinated disclosure so a vendor can fix the issue before details spread.',
    destination: 'MyCERT CVD',
    icon: Bug,
  },
];

const channelOptions: Array<{ id: Channel; label: string; icon: typeof Link2 }> = [
  { id: 'url', label: 'Link', icon: Link2 },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'qr', label: 'QR', icon: QrCode },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'call', label: 'Call', icon: Phone },
  { id: 'other', label: 'Other', icon: Smartphone },
];

const incidentOptions: Array<{ id: IncidentType; label: string }> = [
  { id: 'phishing', label: 'Phishing / fake login' },
  { id: 'fraud', label: 'Financial fraud / scam' },
  { id: 'malware', label: 'Malware / harmful app' },
  { id: 'account_takeover', label: 'Account takeover' },
  { id: 'data_breach', label: 'Data exposure / breach' },
  { id: 'vulnerability', label: 'Software vulnerability' },
  { id: 'other', label: 'Other cyber incident' },
];

const malaysiaStates = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang', 'Perak', 'Perlis',
  'Pulau Pinang', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya',
];

const privacyRules = [
  {
    id: 'secret',
    label: 'An OTP, TAC, PIN or password value',
    help: 'Remove the actual secret. You can still say that the scammer requested it.',
    pattern: /\b(?:OTP|TAC|PIN|passcode|password|kata\s+laluan)\s*(?::|=|is|ialah)\s*[A-Za-z0-9@#$%^&*!]{4,}\b/gi,
    replacement: '[REDACTED SECRET]',
  },
  {
    id: 'identity',
    label: 'A Malaysian identity-card number',
    help: 'Your IC number belongs only in a secure official report when specifically requested.',
    pattern: /\b\d{6}-\d{2}-\d{4}\b/g,
    replacement: '[REDACTED IC NUMBER]',
  },
  {
    id: 'card',
    label: 'A long payment-card number',
    help: 'Never include your full card number in this pack.',
    pattern: /\b(?:\d[ -]?){13,19}\b/g,
    replacement: '[REDACTED CARD NUMBER]',
  },
  {
    id: 'security-code',
    label: 'A CVV or CVC security code',
    help: 'Remove card security codes completely.',
    pattern: /\b(?:CVV|CVC)\s*(?::|=|is|ialah)\s*\d{3,4}\b/gi,
    replacement: '[REDACTED CARD SECURITY CODE]',
  },
];

const stepLabels = ['Choose route', 'Build the signal', 'Review & hand off'];

function scanForSensitiveData(value: string) {
  return privacyRules.filter(rule => new RegExp(rule.pattern.source, rule.pattern.flags).test(value));
}

function redactSensitiveData(value: string) {
  return privacyRules.reduce(
    (safeValue, rule) => safeValue.replace(new RegExp(rule.pattern.source, rule.pattern.flags), rule.replacement),
    value,
  );
}

function labelForIncident(value: IncidentType) {
  return incidentOptions.find(option => option.id === value)?.label ?? value;
}

function labelForChannel(value: Channel) {
  return channelOptions.find(option => option.id === value)?.label ?? value;
}

function formatObservedDate(value: string) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' });
}

async function fingerprint(value: string) {
  const normalized = value.toLowerCase().replace(/\s+/g, ' ').trim();
  const bytes = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export default function Report() {
  const [stage, setStage] = useState(1);
  const [route, setRoute] = useState<ReportRoute>('signal');
  const [type, setType] = useState<Channel>('url');
  const [incidentType, setIncidentType] = useState<IncidentType>('phishing');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [impersonatedEntity, setImpersonatedEntity] = useState('');
  const [firstSeen, setFirstSeen] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportResponse | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const privacyValue = `${content}\n${description}`;
  const privacyFindings = useMemo(() => scanForSensitiveData(privacyValue), [privacyValue]);

  const reportPack = useMemo(() => {
    const routeLabel = route === 'urgent'
      ? 'Financial-fraud emergency — bank and NSRC 997 first'
      : route === 'vulnerability'
        ? 'Coordinated vulnerability disclosure — MyCERT CVD'
        : 'New scam / cyber-threat signal — Cyber999';
    const subject = route === 'vulnerability' ? 'Potential software vulnerability' : labelForIncident(incidentType);

    return [
      'PHISHGUARD MY — AGENCY-READY INCIDENT SUMMARY',
      result?.report_id ? `PhishGuard reference: ${result.report_id}` : null,
      `Recommended route: ${routeLabel}`,
      '',
      `Incident: ${subject}`,
      `Channel: ${labelForChannel(type)}`,
      `First observed: ${formatObservedDate(firstSeen)}`,
      `Location: ${state || 'Not provided'}`,
      `${route === 'vulnerability' ? 'Affected vendor / product' : 'Organisation or identity impersonated'}: ${impersonatedEntity || 'Unknown / not provided'}`,
      '',
      'CHRONOLOGY / WHAT HAPPENED',
      description.trim() || 'Not provided',
      '',
      'INDICATORS / SANITISED EVIDENCE',
      content.trim() || 'No indicator provided',
      '',
      'PRIVACY CHECK',
      'Prepared in the browser. Passwords, OTP/TAC values, PINs, IC numbers and full card details were removed before review.',
      '',
      'STATUS',
      'Prepared for the reporter to review and submit through the official channel. PhishGuard MY does not submit this pack automatically.',
    ].filter(line => line !== null).join('\n');
  }, [content, description, firstSeen, impersonatedEntity, incidentType, result?.report_id, route, state, type]);

  const chooseRoute = (nextRoute: ReportRoute) => {
    setRoute(nextRoute);
    setResult(null);
    setAcknowledged(false);
    setIncidentType(nextRoute === 'vulnerability' ? 'vulnerability' : nextRoute === 'urgent' ? 'fraud' : 'phishing');
  };

  const applyRedactions = () => {
    setContent(current => redactSensitiveData(current));
    setDescription(current => redactSensitiveData(current));
  };

  const copyPack = async () => {
    await navigator.clipboard.writeText(reportPack);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const downloadPack = () => {
    const blob = new Blob([reportPack], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `phishguard-signal-${result?.report_id ?? 'draft'}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const submitCommunitySignal = async () => {
    if (!acknowledged || privacyFindings.length > 0 || !description.trim()) return;
    setLoading(true);
    setError('');
    try {
      const contentHash = await fingerprint(`${type}|${incidentType}|${content}|${description}`);
      const response = await api.submitReport({
        type,
        route,
        incident_type: incidentType,
        content_hash: contentHash,
        content_length: content.length + description.length,
        impersonated_entity: impersonatedEntity.trim() || undefined,
        first_seen: firstSeen || undefined,
        state: state || undefined,
        consent_to_review: true,
      });
      setResult(response);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Could not add this signal to the community queue.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStage(1);
    setRoute('signal');
    setType('url');
    setIncidentType('phishing');
    setContent('');
    setDescription('');
    setImpersonatedEntity('');
    setFirstSeen('');
    setState('');
    setResult(null);
    setAcknowledged(false);
    setError('');
  };

  const canReview = description.trim().length >= 20 && privacyFindings.length === 0;

  return (
    <div className="mx-auto max-w-[1120px]">
      <section className="scroll-reveal flex flex-col gap-4 border-b border-[var(--line-dim)] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="panel-kicker">Student signal relay · official routes built in</p>
          <h1 className="glow-title mt-2 text-4xl sm:text-5xl">Turn a scam sighting into a useful signal.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Choose the right national route, remove private data, and build a clean evidence pack. You stay in control of the final official submission.
          </p>
        </div>
        <a className="button-primary min-h-11 shrink-0 px-4 text-xs" href="tel:997">
          <Phone className="h-4 w-4" /> Money lost? Call 997
        </a>
      </section>

      <nav aria-label="Contribution progress" className="terminal-panel mt-5 p-2">
        <ol className="grid gap-2 sm:grid-cols-3">
          {stepLabels.map((label, index) => {
            const number = index + 1;
            const active = number === stage;
            const complete = number < stage;
            return (
              <li key={label}>
                <button
                  type="button"
                  disabled={number > stage}
                  onClick={() => number <= stage && setStage(number)}
                  aria-current={active ? 'step' : undefined}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-md border px-3 text-left text-xs font-black transition ${
                    active
                      ? 'border-[var(--green)] bg-[rgba(98,255,138,.09)] text-[var(--green)]'
                      : complete
                        ? 'border-[var(--line-dim)] bg-black/20 text-[var(--green-soft)]'
                        : 'border-transparent text-[var(--muted)]'
                  }`}
                >
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${active || complete ? 'border-[var(--green)]' : 'border-[var(--line-dim)]'}`}>
                    {complete ? <Check className="h-3.5 w-3.5" /> : number}
                  </span>
                  {label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {stage === 1 && (
        <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_330px]">
          <div className="terminal-panel scroll-reveal p-4 sm:p-5">
            <div className="mb-5">
              <p className="panel-kicker">01 // Triage</p>
              <h2 className="mt-2 text-2xl font-black text-[var(--ink)]">What happened?</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">The answer changes where the evidence should go.</p>
            </div>

            <div className="grid gap-3">
              {routeOptions.map(option => {
                const Icon = option.icon;
                const active = route === option.id;
                return (
                  <button
                    type="button"
                    key={option.id}
                    aria-pressed={active}
                    onClick={() => chooseRoute(option.id)}
                    className={`group grid min-h-[108px] grid-cols-[44px_1fr_auto] items-start gap-3 rounded-lg border p-4 text-left transition ${
                      active
                        ? 'border-[var(--green)] bg-[rgba(98,255,138,.07)]'
                        : 'border-[var(--line-dim)] bg-black/20 hover:border-[var(--line)]'
                    }`}
                  >
                    <span className={`grid h-11 w-11 place-items-center rounded-md border ${active ? 'border-[var(--green)] text-[var(--green)]' : 'border-[var(--line-dim)] text-[var(--muted)]'}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <strong className="block text-sm text-[var(--ink)]">{option.title}</strong>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{option.description}</span>
                      <span className="mt-2 inline-flex items-center gap-1 text-[0.68rem] font-black uppercase tracking-[0.08em] text-[var(--green)]">
                        Route: {option.destination}
                      </span>
                    </span>
                    <span className={`mt-1 grid h-5 w-5 place-items-center rounded-full border ${active ? 'border-[var(--green)] bg-[var(--green)] text-black' : 'border-[var(--line)]'}`}>
                      {active && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <button type="button" onClick={() => setStage(2)} className="button-primary min-h-11 px-5 text-sm">
                Build the signal <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <aside className="terminal-panel hot scroll-reveal h-fit p-4">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-md border border-[var(--amber)] bg-[rgba(255,209,102,.06)] text-[var(--amber)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-black text-[var(--ink)]">One honest boundary</h2>
            <p className="mt-2 text-xs leading-5 text-[var(--green-soft)]">
              There is no public NSRC API for this site to use. PhishGuard prepares the report and sends you to the verified official channel; it never labels a draft as “sent”.
            </p>
            <div className="mt-4 grid gap-3 border-t border-[var(--line-dim)] pt-4 text-xs leading-5 text-[var(--muted)]">
              <p><strong className="text-[var(--amber)]">NSRC 997</strong> is for rapid response after online financial fraud.</p>
              <p><strong className="text-[var(--green)]">Cyber999</strong> is Malaysia’s national point of contact for computer-security incidents.</p>
              <p><strong className="text-[var(--cyan)]">MyCERT CVD</strong> handles responsible vulnerability disclosure.</p>
            </div>
          </aside>
        </section>
      )}

      {stage === 2 && (
        <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_330px]">
          <div className="terminal-panel scroll-reveal">
            <div className="panel-title px-4 py-3">
              <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> 02 // Build a privacy-safe signal</span>
              <span className="protocol-chip active px-2 py-1">{route}</span>
            </div>

            <form className="p-4 sm:p-5" onSubmit={event => { event.preventDefault(); if (canReview) setStage(3); }}>
              {route === 'urgent' && (
                <div className="mb-5 rounded-lg border border-[rgba(255,209,102,.35)] bg-[rgba(255,209,102,.07)] p-4">
                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--amber)]" />
                    <div>
                      <h3 className="text-sm font-black text-[var(--ink)]">Do not wait for this form</h3>
                      <p className="mt-1 text-xs leading-5 text-[var(--green-soft)]">Call your bank’s fraud hotline and NSRC 997 now. Make a police report after the emergency call.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a href="tel:997" className="button-primary min-h-10 px-4 text-xs"><Phone className="h-4 w-4" /> Call 997</a>
                        <a href={NSRC_GUIDE} target="_blank" rel="noreferrer" className="button-ghost min-h-10 px-4 text-xs">Official NSRC guide <ExternalLink className="h-3.5 w-3.5" /></a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {route === 'vulnerability' && (
                <div className="mb-5 rounded-lg border border-[rgba(103,217,255,.3)] bg-[rgba(103,217,255,.05)] p-4 text-xs leading-5 text-[var(--green-soft)]">
                  <strong className="text-[var(--cyan)]">Coordinated disclosure:</strong> avoid public exploit details, do not access data that is not yours, and give the vendor/MyCERT time to investigate.
                </div>
              )}

              <div className="grid gap-5">
                <fieldset>
                  <legend className="panel-kicker mb-2">Where did it arrive?</legend>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {channelOptions.map(option => {
                      const Icon = option.icon;
                      const active = type === option.id;
                      return (
                        <button
                          type="button"
                          key={option.id}
                          aria-pressed={active}
                          onClick={() => setType(option.id)}
                          className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md border px-1 text-[0.65rem] font-black transition ${
                            active
                              ? 'border-[var(--green)] bg-[rgba(98,255,138,.1)] text-[var(--green)]'
                              : 'border-[var(--line-dim)] bg-black/20 text-[var(--muted)] hover:border-[var(--line)]'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="field-label">Incident type</span>
                    <select
                      value={incidentType}
                      onChange={event => setIncidentType(event.target.value as IncidentType)}
                      disabled={route === 'vulnerability'}
                      className="field min-h-12 px-3"
                    >
                      {incidentOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-2">
                    <span className="field-label">{route === 'vulnerability' ? 'Affected vendor or product' : 'Who were they pretending to be?'}</span>
                    <input
                      value={impersonatedEntity}
                      onChange={event => setImpersonatedEntity(event.target.value)}
                      placeholder={route === 'vulnerability' ? 'Product, version or vendor' : 'Bank, agency, lecturer, platform…'}
                      className="field min-h-12 px-3"
                      maxLength={120}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="field-label">When did you first see it? <span className="font-normal text-[var(--muted)]">(optional)</span></span>
                    <input type="datetime-local" value={firstSeen} onChange={event => setFirstSeen(event.target.value)} className="field min-h-12 px-3" />
                  </label>
                  <label className="grid gap-2">
                    <span className="field-label">State / territory <span className="font-normal text-[var(--muted)]">(optional)</span></span>
                    <select value={state} onChange={event => setState(event.target.value)} className="field min-h-12 px-3">
                      <option value="">Not provided</option>
                      {malaysiaStates.map(item => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="field-label">What happened? <span className="text-[var(--amber)]">Required</span></span>
                  <textarea
                    value={description}
                    onChange={event => setDescription(event.target.value)}
                    placeholder={route === 'vulnerability'
                      ? 'Describe the affected product, impact, discovery method and whether the vendor has been contacted. Do not include an exploit payload.'
                      : 'Write a short chronology: what arrived, what it asked you to do, and why it seemed suspicious.'}
                    rows={5}
                    className="field resize-y px-3 py-3 text-base leading-6"
                    maxLength={1800}
                    required
                  />
                  <span className="text-right text-[0.68rem] text-[var(--muted)]">{description.length}/1800 · at least 20 characters</span>
                </label>

                <label className="grid gap-2">
                  <span className="field-label">Indicators or sanitised evidence <span className="font-normal text-[var(--muted)]">(optional)</span></span>
                  <textarea
                    value={content}
                    onChange={event => setContent(event.target.value)}
                    placeholder={route === 'vulnerability'
                      ? 'Affected URL, version, error or high-level reproduction notes'
                      : 'Suspicious URL, sender handle, phone number, exact message, email header or destination. Do not open links.'}
                    rows={5}
                    className="field resize-y px-3 py-3 text-base leading-6"
                    maxLength={3000}
                  />
                  <span className="text-right text-[0.68rem] text-[var(--muted)]">{content.length}/3000</span>
                </label>

                <div aria-live="polite" className={`rounded-lg border p-4 ${privacyFindings.length ? 'border-[rgba(255,107,107,.38)] bg-[rgba(255,107,107,.07)]' : 'border-[rgba(98,255,138,.25)] bg-[rgba(98,255,138,.05)]'}`}>
                  <div className="flex items-start gap-3">
                    {privacyFindings.length ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--red)]" /> : <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--green)]" />}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-black text-[var(--ink)]">{privacyFindings.length ? 'Sensitive data may be present' : 'No obvious secrets detected'}</h3>
                      {privacyFindings.length ? (
                        <>
                          <ul className="mt-2 grid gap-2 text-xs leading-5 text-[var(--green-soft)]">
                            {privacyFindings.map(finding => <li key={finding.id}><strong className="text-[var(--red)]">{finding.label}.</strong> {finding.help}</li>)}
                          </ul>
                          <button type="button" onClick={applyRedactions} className="button-ghost mt-3 min-h-10 px-4 text-xs">Redact flagged values</button>
                        </>
                      ) : (
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">The check runs in this browser. Still read the pack yourself: automated detection can miss private details.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[var(--line-dim)] pt-4 sm:flex-row sm:justify-between">
                  <button type="button" onClick={() => setStage(1)} className="button-ghost min-h-11 px-4 text-sm"><ArrowLeft className="h-4 w-4" /> Back</button>
                  <button type="submit" disabled={!canReview} className="button-primary min-h-11 px-5 text-sm">Review the pack <ArrowRight className="h-4 w-4" /></button>
                </div>
              </div>
            </form>
          </div>

          <aside className="terminal-panel scroll-reveal h-fit p-4">
            <p className="panel-kicker">What makes a useful signal?</p>
            <div className="mt-4 grid gap-4">
              <SignalTip number="1" title="A short chronology" text="What arrived, when, and what action it demanded." />
              <SignalTip number="2" title="A reusable indicator" text="URL, sender, phone number, email header, app or account destination." />
              <SignalTip number="3" title="No victim secrets" text="Never include your OTP, password, PIN, IC number or full card details." />
            </div>
            <p className="mt-4 border-t border-[var(--line-dim)] pt-4 text-xs leading-5 text-[var(--muted)]">Screenshots can be attached later through the official Cyber999 form. This student site does not upload files.</p>
          </aside>
        </section>
      )}

      {stage === 3 && (
        <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_350px]">
          <div className="terminal-panel scroll-reveal">
            <div className="panel-title px-4 py-3">
              <span className="flex items-center gap-2"><FileCheck2 className="h-4 w-4" /> 03 // Review the evidence pack</span>
              <span className="protocol-chip active px-2 py-1">ready</span>
            </div>
            <div className="p-4 sm:p-5">
              {result && (
                <div className={`mb-4 rounded-lg border p-4 ${result.status === 'offline' ? 'border-[rgba(255,209,102,.35)] bg-[rgba(255,209,102,.06)]' : 'border-[rgba(98,255,138,.3)] bg-[rgba(98,255,138,.06)]'}`}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${result.status === 'offline' ? 'text-[var(--amber)]' : 'text-[var(--green)]'}`} />
                    <div>
                      <h2 className="text-sm font-black text-[var(--ink)]">{result.status === 'offline' ? 'Official pack ready; community queue offline' : 'Anonymous signal metadata received'}</h2>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{result.message}</p>
                      <p className="mt-2 text-xs font-black text-[var(--green-soft)]">Reference: {result.report_id}{result.duplicate_count ? ` · ${result.duplicate_count} similar signal${result.duplicate_count === 1 ? '' : 's'} already seen` : ''}</p>
                    </div>
                  </div>
                </div>
              )}

              <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--line-dim)] bg-black/35 p-4 font-mono text-xs leading-6 text-[var(--green-soft)]">{reportPack}</pre>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => void copyPack()} className="button-primary min-h-11 px-4 text-sm">
                  {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy report pack</>}
                </button>
                <button type="button" onClick={downloadPack} className="button-ghost min-h-11 px-4 text-sm"><Download className="h-4 w-4" /> Download .txt</button>
              </div>

              <div className="mt-5 border-t border-[var(--line-dim)] pt-5">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--line-dim)] bg-black/20 p-3 text-xs leading-5 text-[var(--green-soft)]">
                  <input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--green)]" />
                  <span>I reviewed the pack, removed private secrets, and consent to PhishGuard storing only category, channel, approximate location, timing and a one-way duplicate fingerprint. The full evidence stays in this browser unless I send it through an official channel.</span>
                </label>

                {error && <p role="alert" className="mt-3 text-sm text-[var(--red)]">{error}</p>}

                <button
                  type="button"
                  disabled={loading || !acknowledged || Boolean(result)}
                  onClick={() => void submitCommunitySignal()}
                  className="button-ghost mt-3 min-h-11 w-full px-4 text-sm"
                >
                  {loading ? 'Adding anonymous signal…' : result ? 'Signal metadata added' : <><Send className="h-4 w-4" /> Add anonymous signal to PhishGuard</>}
                </button>
                <p className="mt-2 text-center text-[0.68rem] leading-5 text-[var(--muted)]">This community step is separate from the official report below. It cannot trigger an NSRC response.</p>
              </div>

              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button type="button" onClick={() => setStage(2)} className="text-link-button min-h-10 text-xs"><ArrowLeft className="h-3.5 w-3.5" /> Edit details</button>
                <button type="button" onClick={reset} className="text-link-button min-h-10 text-xs">Start a new signal</button>
              </div>
            </div>
          </div>

          <aside className="terminal-panel hot scroll-reveal h-fit p-4">
            <p className="panel-kicker">Official handoff</p>
            <h2 className="mt-2 text-xl font-black text-[var(--ink)]">
              {route === 'urgent' ? 'Act now, then preserve evidence.' : route === 'vulnerability' ? 'Disclose privately to MyCERT.' : 'Send the signal to Cyber999.'}
            </h2>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Copy the pack, open the official destination, review every field and submit it yourself.
            </p>

            <div className="mt-4 grid gap-3">
              {route === 'urgent' ? (
                <>
                  <a href="tel:997" className="button-primary min-h-12 px-4 text-sm"><Phone className="h-4 w-4" /> Call NSRC 997</a>
                  <a href={NSRC_GUIDE} target="_blank" rel="noreferrer" className="button-ghost min-h-11 px-4 text-xs">Read official NSRC steps <ExternalLink className="h-3.5 w-3.5" /></a>
                  <p className="rounded-md border border-[var(--line-dim)] bg-black/20 p-3 text-xs leading-5 text-[var(--green-soft)]">Also call your bank’s fraud hotline immediately and make a police report. 997 is an emergency response line, not a case-follow-up desk.</p>
                </>
              ) : route === 'vulnerability' ? (
                <>
                  <a href="mailto:cvd@cybersecurity.my?subject=Coordinated%20vulnerability%20disclosure" className="button-primary min-h-12 px-4 text-sm"><Mail className="h-4 w-4" /> Email MyCERT CVD</a>
                  <a href={CVD_GUIDE} target="_blank" rel="noreferrer" className="button-ghost min-h-11 px-4 text-xs">Read CVD requirements <ExternalLink className="h-3.5 w-3.5" /></a>
                </>
              ) : (
                <>
                  <a href={CYBER999_FORM} target="_blank" rel="noreferrer" className="button-primary min-h-12 px-4 text-sm"><Globe2 className="h-4 w-4" /> Open Cyber999 form</a>
                  <a href="mailto:cyber999@cybersecurity.my?subject=Cyber%20incident%20report" className="button-ghost min-h-11 px-4 text-xs"><Mail className="h-4 w-4" /> Email cyber999@cybersecurity.my</a>
                  <a href={CYBER999_OVERVIEW} target="_blank" rel="noreferrer" className="inline-link justify-center py-2 text-xs">Verify reporting channels <ExternalLink className="h-3.5 w-3.5" /></a>
                </>
              )}
            </div>

            <div className="mt-5 border-t border-[var(--line-dim)] pt-4">
              <h3 className="text-xs font-black uppercase tracking-[0.08em] text-[var(--amber)]">Prize integrity</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Leaderboard credit should be awarded only after a reviewer confirms the signal is unique, useful and safely collected—not for raw report volume.</p>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}

function SignalTip({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--line)] text-xs font-black text-[var(--green)]">{number}</span>
      <div>
        <h3 className="text-xs font-black text-[var(--ink)]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{text}</p>
      </div>
    </div>
  );
}
