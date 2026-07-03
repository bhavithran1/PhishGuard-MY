import { useState } from 'react';
import { AlertTriangle, CheckCircle, FileText, Link2, Mail, MessageSquare, QrCode, Send } from 'lucide-react';
import { api } from '../api';
import type { ReportResponse } from '../api';

const threatTypes = [
  { id: 'url', label: 'URL', icon: Link2 },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'email', label: 'MAIL', icon: Mail },
  { id: 'qr', label: 'QR', icon: QrCode },
];

export default function Report() {
  const [type, setType] = useState('url');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportResponse | null>(null);

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await api.submitReport({
        type,
        content: content.trim(),
        reporter_email: email.trim() || undefined,
        description: description.trim() || undefined,
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="terminal-panel hot scroll-reveal p-6 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center border border-[var(--green)] bg-[rgba(101,255,105,0.08)] text-[var(--green)]">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h2 className="glow-title text-3xl">REPORT ACCEPTED</h2>
          <p className="mono mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--green-soft)]">{result.message}</p>
          <div className="mono mx-auto mt-5 w-fit border border-[var(--line)] bg-black/40 px-4 py-3 text-sm font-black">
            <span className="text-[var(--muted)]">REPORT ID // </span>
            <span className="text-[var(--amber)]">{result.report_id}</span>
          </div>
          <button
            onClick={() => {
              setResult(null);
              setContent('');
              setDescription('');
            }}
            className="button-primary mt-6 min-h-11 px-5 text-sm"
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px]">
      <section className="scroll-reveal flex flex-col gap-4 border-b border-[var(--line-dim)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="panel-kicker">Incident channel</p>
          <h2 className="glow-title mt-2 text-4xl sm:text-5xl">SUBMIT REPORT</h2>
          <p className="mono mt-2 text-sm uppercase tracking-[0.1em] text-[var(--muted)]">
            Suspicious links, messages, QR targets, or phishing emails
          </p>
        </div>
        <div className="protocol-chip active w-fit px-3 py-2">CYBER999 READY</div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="terminal-panel scroll-reveal">
          <div className="panel-title px-4 py-3">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Report console
            </span>
            <span className="protocol-chip active px-2 py-0.5">{type}</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {threatTypes.map(option => {
                const Icon = option.icon;
                const active = type === option.id;
                return (
                  <button
                    key={option.id}
                    aria-label={option.label}
                    aria-pressed={active}
                    onClick={() => setType(option.id)}
                    className={`mono flex min-h-10 items-center justify-center gap-2 border px-2 text-xs font-black uppercase tracking-[0.1em] transition ${
                      active
                        ? 'border-[var(--amber)] bg-[var(--amber)] text-black'
                        : 'border-[var(--line-dim)] bg-black/35 text-[var(--green-soft)] hover:border-[var(--green)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid gap-5">
              <label className="grid gap-2">
                <span className="panel-kicker">
                  {type === 'url' ? 'Suspicious URL' : 'Suspicious content'}
                </span>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={
                    type === 'url' ? 'https://target.example/login' :
                    type === 'sms' ? 'Paste SMS lure content' :
                    type === 'email' ? 'Paste email content' :
                    'Describe QR placement or destination'
                  }
                  rows={5}
                  className="field resize-none px-3 py-3 text-sm leading-6"
                />
              </label>

              <label className="grid gap-2">
                <span className="panel-kicker">Additional context // optional</span>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Where did you see it?"
                  rows={3}
                  className="field resize-none px-3 py-3 text-sm leading-6"
                />
              </label>

              <label className="grid gap-2">
                <span className="panel-kicker">Callback email // optional</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="field min-h-11 px-3 py-3 text-sm"
                />
              </label>

              <button
                onClick={submit}
                disabled={loading || !content.trim()}
                className="button-primary min-h-12 px-5 text-sm"
              >
                {loading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <aside className="terminal-panel hot scroll-reveal h-fit p-4">
          <div className="mb-4 grid h-11 w-11 place-items-center border border-[var(--amber)] bg-black/50 text-[var(--amber)]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="panel-kicker">Routing</h3>
          <div className="mono mt-4 grid gap-3 text-xs leading-5 text-[var(--green-soft)]">
            <p>Reports are prepared for MyCERT / Cyber999, NACSA, and MCMC review paths.</p>
            <p>Emergency cybersecurity incidents should still go directly to Cyber999 at 1-300-88-2999.</p>
            <p className="border-t border-[var(--line-dim)] pt-3 text-[var(--muted)]">
              Do not paste passwords, TAC codes, OTPs, or banking secrets here.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
