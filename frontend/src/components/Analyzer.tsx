import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Link2,
  MessageSquare,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
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

export default function Analyzer({ onGetHelp, onNavigate }: { onGetHelp: () => void; onNavigate: (tab: string) => void }) {
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
    setError('');
  };

  const samples = mode === 'url' ? urlSamples : textSamples;

  return (
    <div className="mx-auto max-w-[1320px]">
      <section className="student-hero scroll-reveal">
        <div className="student-hero-copy">
          <div className="hero-badge"><Sparkles className="h-3.5 w-3.5" /> Made for campus life in Malaysia</div>
          <h1>Scammers want you to rush.<br /><span>Take your time back.</span></h1>
          <p>Check the message. Learn the trick. Warn your circle. PhishGuard gives students a calm place to think before the next click.</p>
          <div className="hero-actions">
            <button onClick={() => onNavigate('learn')} className="button-primary min-h-12 px-5 text-sm">
              Learn the red flags <BookOpen className="h-4 w-4" />
            </button>
            <button onClick={() => onNavigate('cybersquad')} className="text-link-button">Join the campus challenge <ArrowRight className="h-4 w-4" /></button>
          </div>
          <button onClick={onGetHelp} className="urgent-text-link">Already sent money or shared a password? Get urgent steps →</button>
          <div className="peer-note">
            <div className="peer-faces" aria-hidden="true"><span>UM</span><span>UTM</span><span>USM</span></div>
            <p><strong>Built around real student moments:</strong> parcel texts, fake jobs, account alerts and “too good to be true” DMs.</p>
          </div>
        </div>

        <div id="safety-check" className="quick-check-card">
          <div className="quick-check-heading">
            <div className="quick-check-icon"><ShieldCheck className="h-5 w-5" /></div>
            <div><span>Start here</span><h2>Something feel off? Paste it.</h2></div>
          </div>
          <p className="quick-check-intro">You do not need to open the link. We will point out common scam signals and explain what they mean.</p>
          <div className="mt-5">
            <div className="mode-switch mb-4 grid grid-cols-2 gap-1">
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
              <div className="grid gap-3">
                <label htmlFor="scam-link" className="field-label">Suspicious link</label>
                <input
                  id="scam-link"
                  aria-label="Suspicious link"
                  aria-describedby="checker-privacy"
                  type="text"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && analyze()}
                  placeholder="Paste a link — do not open it first"
                  className="field min-h-14 px-4 py-3 text-sm"
                  maxLength={2048}
                />
                <button
                  onClick={analyze}
                  disabled={loading || !input.trim()}
                  className="button-primary min-h-12 w-full px-5 text-sm"
                >
                  <Search className="h-4 w-4" />
                  Check link
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                <label htmlFor="scam-message" className="field-label">Suspicious message</label>
                <textarea
                  id="scam-message"
                  aria-label="Suspicious message"
                  aria-describedby="checker-privacy"
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

            <details className="sample-drawer mt-4">
              <summary>Try a safe practice example</summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {samples.map(sample => (
                  <button key={sample.label} onClick={() => setInput(sample.value)} className="sample-button">
                    {sample.label}
                  </button>
                ))}
              </div>
            </details>

            {loading && (
              <div aria-live="polite" className="mt-5 flex items-center gap-3 text-sm font-bold text-[var(--green)]">
                <div className="h-4 w-4 rounded-full border-2 border-[rgba(255,211,90,0.35)] border-t-[var(--amber)] animate-spin" />
                Checking for common risk signals...
              </div>
            )}

            {error && (
              <div role="alert" className="result-error mt-5">
                <div className="flex items-center gap-3 text-sm font-bold">
                  <XCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              </div>
            )}

            {result && (
              <div role="status" aria-live="polite" className="animate-slide-up mt-5">
                {result.mode === 'url' ? <URLResult data={result.data} /> : <TextResult data={result.data} />}
              </div>
            )}
            <div id="checker-privacy" className="privacy-line"><Shield className="h-4 w-4" /><span>Remove names and personal details. Never paste passwords, OTPs, TACs, PINs or card numbers.</span></div>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <LiveFeedPanel />
      </section>
    </div>
  );
}

function LiveFeedPanel() {
  return (
    <div className="signals-section scroll-reveal">
      <div className="panel-title px-5 py-4">
        <span>Four signals worth remembering</span>
        <span className="protocol-chip active px-2 py-0.5">Save this</span>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4">
        {feedRows.map(row => (
          <div key={row.place} className="signal-card p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className={`text-base font-extrabold ${row.tone}`}>{row.place}</h3>
              <span className="protocol-chip px-1.5 py-0.5 text-[0.62rem]">{row.tag}</span>
            </div>
            <p className="text-sm leading-6 text-[var(--green-soft)]">{row.line}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">One cue is not proof. Several together mean it is time to verify.</p>
          </div>
        ))}
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
      className={`mode-button flex min-h-11 items-center justify-center gap-2 px-3 text-sm font-bold transition ${active ? 'active' : ''}`}
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
        title={isPhishing ? 'Common scam warning signs found' : 'No common warning signs found'}
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
        title={isSuspicious ? 'Common scam warning signs found' : 'No common warning signs found'}
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
                {url.is_phishing ? 'WARNING SIGNS' : 'NO COMMON SIGNS'} · {Math.round(url.confidence * 100)}% · {url.url}
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
          <h3 className={`text-base font-extrabold ${unsafe ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>{title}</h3>
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
      {active ? 'Found' : 'Not found'} · {label}
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
