import { ArrowUpRight, BanknoteArrowDown, CheckCircle2, Copy, Phone, ShieldAlert, Smartphone } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

export default function ActionPlan({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copyChecklist = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText('I was targeted by a scam. I have stopped contact, secured my account, and saved the relevant messages, transaction details, phone numbers, URLs, dates and times.');
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 1800);
    } catch {
      setCopyStatus('failed');
    }
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      <section className="action-hero scroll-reveal">
        <div>
          <p className="eyebrow">You are not alone</p>
          <h1>Act fast. Stay calm.<br /><span>Keep your evidence.</span></h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--green-soft)]">
            If money, a bank account, an OTP, or login details are involved, stop engaging with the scammer and use an official support channel immediately. This page does not submit a report for you.
          </p>
        </div>
        <div className="action-badge">
          <ShieldAlert className="h-8 w-8" />
          <span>Urgent support<br />guide</span>
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-3">
        <ActionCard number="1" title="Contact your bank" icon={<BanknoteArrowDown className="h-5 w-5" />} tone="red">
          If a transfer, card, or e-wallet payment was made, call your bank or provider through the number in its official app or website. Ask what can be secured or recalled.
        </ActionCard>
        <ActionCard number="2" title="Call NSRC: 997" icon={<Phone className="h-5 w-5" />} tone="amber">
          Malaysia’s National Scam Response Centre is the immediate official route for scam victims. Call as soon as possible after a financial loss.
          <a className="inline-link mt-3" href="tel:997">Call 997 now <ArrowUpRight className="h-3.5 w-3.5" /></a>
        </ActionCard>
        <ActionCard number="3" title="Secure your access" icon={<Smartphone className="h-5 w-5" />} tone="cyan">
          Change compromised passwords from a trusted device, turn on MFA, and warn contacts if your social account or number may be used to impersonate you.
        </ActionCard>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <div className="terminal-panel scroll-reveal p-5 sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div>
              <p className="eyebrow">Evidence checklist</p>
              <h2 className="mt-1 text-2xl font-black text-white">Save it before it disappears</h2>
            </div>
            <button onClick={copyChecklist} className="button-ghost min-h-11 shrink-0 px-3 text-xs">
              <Copy className="h-3.5 w-3.5" /> {copyStatus === 'copied' ? 'Copied' : copyStatus === 'failed' ? 'Copy unavailable' : 'Copy note'}
            </button>
          </div>
          <span role="status" aria-live="polite" className="sr-only">{copyStatus === 'copied' ? 'Evidence note copied.' : copyStatus === 'failed' ? 'Could not copy the evidence note.' : ''}</span>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {['Screenshots of the message, profile, and website', 'Transaction reference, account number, amount, date and time', 'Phone numbers, usernames, URLs, and email headers', 'A short timeline: what happened and what you shared'].map(item => (
              <div key={item} className="flex gap-3 rounded-lg border border-[var(--line-dim)] bg-black/20 p-3 text-sm leading-5 text-[var(--green-soft)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--green)]" />{item}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--muted)]">Do not send your passwords, OTP/TAC, PIN, or full card number to anyone collecting evidence.</p>
        </div>

        <aside className="terminal-panel hot scroll-reveal p-5">
          <p className="eyebrow">Official pathways</p>
          <h2 className="mt-1 text-2xl font-black text-white">Use the right channel</h2>
          <div className="mt-4 grid gap-3 text-sm leading-5 text-[var(--green-soft)]">
            <OfficialLink label="Check a suspicious account or phone" detail="PDRM Semak Mule" href="https://semakmule.rmp.gov.my" />
            <OfficialLink label="Report a cyber incident" detail="Cyber999 / MyCERT" href="https://www.cybersecurity.my/portal-main/services/cyber999-overview" />
            <OfficialLink label="Prepare a structured, privacy-aware report" detail="Use PhishGuard’s student intake" onClick={() => onNavigate('report')} />
          </div>
        </aside>
      </section>

      <section className="mt-5 rounded-xl border border-[var(--line-dim)] bg-[rgba(101,255,105,0.045)] p-5 text-sm leading-6 text-[var(--green-soft)] scroll-reveal">
        <p className="font-bold text-white">For cyber incidents without an immediate financial loss</p>
        <p className="mt-1">Cyber999 lists online reporting, email, and support channels for incidents such as phishing and data breach. Its published hotline is <a className="inline-link" href="tel:1300882999">1-300-88-2999</a>, with a separate 24/7 emergency number for DDoS, phishing, and data breach at <a className="inline-link" href="tel:+60192665850">+6019-266 5850</a>.</p>
      </section>
    </div>
  );
}

function ActionCard({ number, title, icon, tone, children }: { number: string; title: string; icon: ReactNode; tone: 'red' | 'amber' | 'cyan'; children: ReactNode }) {
  return <article className={`action-card ${tone} scroll-reveal`}>
    <div className="flex items-center justify-between"><span className="mono text-xs font-black">0{number}</span><span>{icon}</span></div>
    <h2>{title}</h2><div className="text-sm leading-6 text-[var(--green-soft)]">{children}</div>
  </article>;
}

function OfficialLink({ label, detail, href, onClick }: { label: string; detail: string; href?: string; onClick?: () => void }) {
  const content = <><span><strong className="block text-white">{label}</strong><span className="text-xs text-[var(--muted)]">{detail}</span></span><ArrowUpRight className="h-4 w-4 shrink-0" /></>;
  return href ? <a className="official-link" href={href} target="_blank" rel="noreferrer">{content}</a> : <button className="official-link w-full text-left" onClick={onClick}>{content}</button>;
}
