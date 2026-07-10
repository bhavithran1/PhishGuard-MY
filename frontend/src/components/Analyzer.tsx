import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  DatabaseZap,
  Globe2,
  Link2,
  MessageSquare,
  Search,
  Shield,
  XCircle,
} from 'lucide-react';
import { api } from '../api';
import type { TextAnalysis, URLAnalysis } from '../api';

type AnalysisMode = 'url' | 'text';
type Result = { mode: 'url'; data: URLAnalysis } | { mode: 'text'; data: TextAnalysis };

const urlSamples = [
  { label: 'MAYBANK', value: 'http://maybank2u-login.tk/verify' },
  { label: 'PDRM', value: 'https://pdrm-saman.xyz/bayar-denda' },
  { label: 'SAFE BANK', value: 'https://www.maybank2u.com.my/' },
  { label: 'IP PHISH', value: 'http://192.168.1.1/bank/login.php' },
];

const textSamples = [
  {
    label: 'PDRM',
    value: 'PDRM: Anda mempunyai saman trafik yang belum dibayar sebanyak RM300. Bayar segera di http://pdrm-saman.tk/bayar sebelum akaun anda digantung.',
  },
  {
    label: 'BANK',
    value: 'Maybank: Unusual activity detected on your account. Verify now at http://maybank2u-secure.xyz/login to prevent suspension.',
  },
  {
    label: 'TNG',
    value: 'Tahniah! Anda telah memenangi RM5000 cashback Touch n Go eWallet. Tuntut hadiah anda sekarang: http://tng-reward.top/claim',
  },
];

const feedRows = [
  { place: 'Urgency', tag: 'PAUSE', line: '“Pay now”, “account suspended”, or a countdown designed to rush you.', tone: 'text-[var(--amber)]' },
  { place: 'Impersonation', tag: 'VERIFY', line: 'A familiar bank, agency or delivery brand paired with an unusual domain.', tone: 'text-[var(--cyan)]' },
  { place: 'Payment pressure', tag: 'STOP', line: 'Requests for OTP/TAC, deposits, cryptocurrency, gift cards or unknown transfers.', tone: 'text-[var(--red)]' },
  { place: 'Too good to be true', tag: 'CHECK', line: 'Easy jobs, prizes, refunds or investment returns with no independent verification.', tone: 'text-[var(--magenta)]' },
];

export default function Analyzer({ onGetHelp }: { onGetHelp: () => void }) {
  const [mode, setMode] = useState<AnalysisMode>('url');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      if (mode === 'url') {
        const data = await api.analyzeURL(input.trim());
        setResult({ mode: 'url', data });
      } else {
        const data = await api.analyzeText(input.trim());
        setResult({ mode: 'text', data });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const setModeCleanly = (nextMode: AnalysisMode) => {
    setMode(nextMode);
    setResult(null);
    setInput('');
    setError('');
  };

  const samples = mode === 'url' ? urlSamples : textSamples;

  return (
    <div className="mx-auto max-w-[1500px]">
      <section className="grid gap-5 xl:grid-cols-[1fr_390px]">
        <div className="scroll-reveal">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[var(--line-dim)] pb-4">
            <div>
              <p className="eyebrow">A safer next step for students</p>
              <h1 className="glow-title mt-2 text-4xl leading-none sm:text-5xl lg:text-6xl">CHECK BEFORE<br />YOU CLICK.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--green-soft)]">
                Paste a suspicious link or message for a quick learning-oriented risk check. Do not open the link, log in through it, or share any OTP/TAC.
              </p>
            </div>
            <div className="hidden min-w-52 text-right text-sm leading-6 text-[var(--green-soft)] sm:block">
              <p className="font-bold text-[var(--amber)]">Already sent money?</p>
              <button onClick={onGetHelp} className="inline-link mt-1">Open urgent steps →</button>
            </div>
          </div>
        </div>

        <div className="terminal-panel hot scroll-reveal p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center border border-[var(--line)] bg-black text-[var(--green)]">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="panel-kicker">Privacy-first check</p>
              <p className="mono mt-1 text-sm leading-6 text-[var(--green-soft)]">
                We use your input to produce this check. Avoid personal data and never paste passwords, OTPs, TACs, PINs or card numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[420px_1fr_330px]">
        <LiveFeedPanel />

        <div className="terminal-panel scroll-reveal">
          <div className="panel-title px-4 py-3">
            <span>Safety check</span>
            <span className="protocol-chip active px-2 py-0.5">{mode === 'url' ? 'LINK' : 'MESSAGE'}</span>
          </div>
          <div className="p-4">
            <div className="mb-4 grid grid-cols-2 gap-2">
              <ModeButton
                active={mode === 'url'}
                icon={<Link2 className="h-4 w-4" />}
                label="LINK / URL"
                onClick={() => setModeCleanly('url')}
              />
              <ModeButton
                active={mode === 'text'}
                icon={<MessageSquare className="h-4 w-4" />}
                label="MESSAGE"
                onClick={() => setModeCleanly('text')}
              />
            </div>

            {mode === 'url' ? (
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && analyze()}
                  placeholder="Paste a link — do not open it first"
                  className="field min-h-12 px-3 py-3 text-sm"
                  maxLength={2048}
                />
                <button
                  onClick={analyze}
                  disabled={loading || !input.trim()}
                  className="button-primary min-h-12 px-5 text-sm"
                >
                  <Search className="h-4 w-4" />
                  Check link
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Paste the message text. Remove personal details first."
                  rows={6}
                  className="field resize-none px-3 py-3 text-sm leading-6"
                  maxLength={10000}
                />
                <button
                  onClick={analyze}
                  disabled={loading || !input.trim()}
                  className="button-primary min-h-12 px-5 text-sm sm:w-fit"
                >
                  <Search className="h-4 w-4" />
                  Check message
                </button>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="panel-kicker">Safe practice examples</span>
              {samples.map(sample => (
                <button key={sample.label} onClick={() => setInput(sample.value)} className="button-ghost px-2.5 py-1.5 text-xs">
                  {sample.label}
                </button>
              ))}
            </div>

            {loading && (
              <div className="mono mt-5 flex items-center gap-3 text-sm font-black uppercase text-[var(--amber)]">
                <div className="h-4 w-4 rounded-full border-2 border-[rgba(255,211,90,0.35)] border-t-[var(--amber)] animate-spin" />
                Checking for common risk signals...
              </div>
            )}

            {error && (
              <div className="mt-5 border border-[rgba(255,77,77,0.45)] bg-[rgba(255,77,77,0.08)] p-3 text-[var(--red)]">
                <div className="mono flex items-center gap-3 text-sm font-black">
                  <XCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              </div>
            )}

            {result && (
              <div className="animate-slide-up mt-5">
                {result.mode === 'url' ? <URLResult data={result.data} /> : <TextResult data={result.data} />}
              </div>
            )}
          </div>
        </div>

        <SignalPanel />
      </section>
    </div>
  );
}

function LiveFeedPanel() {
  return (
    <div className="terminal-panel scroll-reveal">
      <div className="panel-title px-4 py-3">
        <span>Four cues to notice</span>
        <span className="protocol-chip active px-2 py-0.5">LEARN</span>
      </div>
      <div className="divide-y divide-[var(--line-dim)]">
        {feedRows.map(row => (
          <div key={row.place} className="p-4">
            <div className="mb-1 flex items-center justify-between gap-3">
              <h3 className={`mono text-sm font-black ${row.tone}`}>{row.place}</h3>
              <span className="protocol-chip px-1.5 py-0.5 text-[0.62rem]">{row.tag}</span>
            </div>
            <p className="mono text-xs leading-5 text-[var(--green-soft)]">{row.line}</p>
            <p className="mono mt-1 text-xs text-[var(--muted)]">One cue alone is not proof. Several cues together are a reason to verify independently.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignalPanel() {
  return (
    <div className="grid gap-4">
      <div className="terminal-panel scroll-reveal p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="panel-kicker flex items-center gap-2">
            <Globe2 className="h-4 w-4" />
            What this can do
          </h3>
          <span className="protocol-chip active px-2 py-0.5">GUIDE</span>
        </div>
        <p className="text-sm leading-6 text-[var(--green-soft)]">Highlights suspicious wording, domains and scam patterns commonly seen in Malaysia.</p>
        <p className="mt-3 border-t border-[var(--line-dim)] pt-3 text-xs leading-5 text-[var(--muted)]">It cannot prove a sender is genuine or replace your bank, provider, or an official report.</p>
      </div>

      <div className="terminal-panel scroll-reveal p-4">
        <h3 className="panel-kicker mb-4 flex items-center gap-2">
          <DatabaseZap className="h-4 w-4" />
          A safer verification routine
        </h3>
        <ol className="grid gap-3 pl-4 text-sm leading-5 text-[var(--green-soft)] marker:text-[var(--amber)]">
          <li>Pause — do not click or reply under pressure.</li>
          <li>Use an official app or saved contact to verify.</li>
          <li>Check a payee or phone via PDRM Semak Mule before any transfer.</li>
          <li>Keep evidence and use official help if money or credentials were shared.</li>
        </ol>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`mono flex min-h-10 items-center justify-center gap-2 border px-3 text-xs font-black uppercase tracking-[0.1em] transition ${
        active
          ? 'border-[var(--amber)] bg-[var(--amber)] text-black'
          : 'border-[var(--line-dim)] bg-black/35 text-[var(--green-soft)] hover:border-[var(--green)]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function URLResult({ data }: { data: URLAnalysis }) {
  const isPhishing = data.is_phishing;
  const score = Math.round(data.confidence * 100);
  const tone = getTone(data.risk_level, isPhishing);

  return (
    <div className={`border p-4 ${tone.surface}`}>
      <ResultHeader
        unsafe={isPhishing}
        title={isPhishing ? 'PHISHING DETECTED' : 'NO STRONG HIT'}
        detail={data.url}
        score={score}
        level={data.risk_level}
      />
      <RiskMeter label="Threat confidence" percent={score} tone={tone.fill} />
      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Treat this as a prompt to verify through an official channel, not proof that a link is safe or unsafe.</p>
      {data.risk_factors.length > 0 && (
        <div className="mt-4 grid gap-2">
          {data.risk_factors.map((factor, i) => (
            <div key={i} className="mono flex items-start gap-2 border border-[var(--line-dim)] bg-black/30 p-2 text-xs leading-5 text-[var(--green-soft)]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--amber)]" />
              {factor}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TextResult({ data }: { data: TextAnalysis }) {
  const isSuspicious = data.is_suspicious;
  const score = Math.round(data.risk_score * 100);
  const tone = getTone(data.risk_level, isSuspicious);

  return (
    <div className={`border p-4 ${tone.surface}`}>
      <ResultHeader
        unsafe={isSuspicious}
        title={isSuspicious ? 'SCAM SIGNALS FOUND' : 'NO STRONG HIT'}
        detail={
          data.matched_patterns.length > 0
            ? `${data.matched_patterns.length} pattern${data.matched_patterns.length > 1 ? 's' : ''} matched`
            : 'No known scam pattern matched'
        }
        score={score}
        level={data.risk_level}
      />
      <RiskMeter label="Risk score" percent={score} tone={tone.fill} />
      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Treat this as a prompt to verify through an official channel, not proof that a sender is genuine.</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Indicator label="Urgency" active={data.urgency_detected} />
        <Indicator label="Manglish" active={data.manglish_detected} />
        <Indicator label="Action bait" active={data.suspicious_actions.length > 0} />
      </div>

      {data.matched_patterns.length > 0 && (
        <div className="mt-4 grid gap-2">
          {data.matched_patterns.map((p, i) => {
            const patternTone = getTone(p.severity, true);
            return (
              <div key={i} className={`border p-3 ${patternTone.surface}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mono text-sm font-black uppercase text-[var(--green)]">{formatPatternName(p.pattern)}</p>
                    <p className="mono mt-1 text-xs leading-5 text-[var(--muted)]">{p.description}</p>
                  </div>
                  <span className="protocol-chip px-2 py-0.5">{p.severity}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.matched_keywords.map(keyword => (
                    <span key={keyword} className="protocol-chip px-1.5 py-0.5 text-[0.62rem]">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data.embedded_urls.length > 0 && (
        <div className="mt-4 border-t border-[var(--line-dim)] pt-4">
          <p className="panel-kicker mb-2">Embedded URLs</p>
          <div className="grid gap-2">
            {data.embedded_urls.map(url => (
              <p key={url.url} className="mono break-all text-xs leading-5 text-[var(--cyan)]">
                {url.is_phishing ? 'PHISH ' : 'SAFE '} // {Math.round(url.confidence * 100)}% // {url.url}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultHeader({
  unsafe,
  title,
  detail,
  score,
  level,
}: {
  unsafe: boolean;
  title: string;
  detail: string;
  score: number;
  level: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <div className={`grid h-11 w-11 shrink-0 place-items-center border ${unsafe ? 'border-[var(--red)] text-[var(--red)]' : 'border-[var(--green)] text-[var(--green)]'}`}>
          {unsafe ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
        </div>
        <div className="min-w-0">
          <h3 className={`mono text-base font-black uppercase ${unsafe ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>{title}</h3>
          <p className="mono mt-1 break-all text-xs leading-5 text-[var(--green-soft)]">{detail}</p>
        </div>
      </div>
      <div className="mono shrink-0 text-left sm:text-right">
        <div className="text-4xl font-black text-[var(--amber)]">{score}%</div>
        <div className="text-xs font-black uppercase text-[var(--muted)]">{level} risk</div>
      </div>
    </div>
  );
}

function RiskMeter({ label, percent, tone }: { label: string; percent: number; tone: string }) {
  return (
    <div className="mt-4">
      <div className="mono mb-2 flex justify-between text-xs font-black uppercase text-[var(--muted)]">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="rank-bar">
        <span style={{ width: `${percent}%`, background: tone }} />
      </div>
    </div>
  );
}

function Indicator({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`mono border p-2 text-center text-xs font-black uppercase ${
      active
        ? 'border-[var(--red)] bg-[rgba(255,77,77,0.1)] text-[var(--red)]'
        : 'border-[var(--line-dim)] bg-black/25 text-[var(--muted)]'
    }`}>
      {active ? 'hit' : 'clear'} // {label}
    </div>
  );
}

function getTone(level: string, unsafe: boolean) {
  const normalized = level.toLowerCase();
  if (!unsafe || normalized === 'low') {
    return {
      fill: 'var(--green)',
      surface: 'border-[rgba(101,255,105,0.34)] bg-[rgba(101,255,105,0.055)]',
    };
  }

  if (normalized === 'medium') {
    return {
      fill: 'var(--amber)',
      surface: 'border-[rgba(255,211,90,0.42)] bg-[rgba(255,211,90,0.07)]',
    };
  }

  return {
    fill: 'var(--red)',
    surface: 'border-[rgba(255,77,77,0.48)] bg-[rgba(255,77,77,0.08)]',
  };
}

function formatPatternName(pattern: string) {
  return pattern.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
