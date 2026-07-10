import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, MapPin, Radio, Shield, Users } from 'lucide-react';
import { api } from '../api';
import type { Threat } from '../api';

type Pattern = {
  name: string;
  description: string;
  severity: string;
  keyword_count: number;
  sample_keywords: string[];
};

export default function ThreatFeed() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);

  useEffect(() => {
    Promise.all([api.getThreats(), api.getPatterns()])
      .then(([t, p]) => {
        setThreats(t.threats);
        setPatterns(p.patterns);
        setSelectedThreat(t.threats[0] ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[rgba(101,255,105,0.28)] border-t-[var(--green)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <section className="scroll-reveal flex flex-col gap-4 border-b border-[var(--line-dim)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="panel-kicker">Practice scenario library</p>
          <h2 className="glow-title mt-2 text-4xl sm:text-5xl">SCAM PATTERNS</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Illustrative Malaysian scam scenarios for learning and discussion. They are not a real-time alert feed or a list of verified active campaigns.
          </p>
        </div>
        <div className="mono flex w-fit items-center gap-2 border border-[var(--line)] bg-black/40 px-3 py-2 text-xs font-black uppercase text-[var(--green)]">
          <span className="status-dot" />
          {threats.length} learning scenarios
        </div>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_420px_330px]">
        <div className="terminal-panel scroll-reveal">
          <div className="panel-title px-4 py-3">
            <span>Scenario cards</span>
            <span className="protocol-chip active px-2 py-0.5">EDUCATION</span>
          </div>
          <div className="divide-y divide-[var(--line-dim)]">
            {threats.map(threat => {
              const tone = severityTone(threat.severity);
              const isSelected = selectedThreat?.id === threat.id;
              return (
                <button
                  key={threat.id}
                  onClick={() => setSelectedThreat(threat)}
                  className={`block w-full p-4 text-left transition hover:bg-[rgba(101,255,105,0.045)] ${
                    isSelected ? 'bg-[rgba(255,211,90,0.08)]' : ''
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className={`mono truncate text-sm font-black ${tone.text}`}>{threat.title}</h3>
                      <p className="mono mt-1 text-xs leading-5 text-[var(--green-soft)]">{threat.description}</p>
                    </div>
                    <span className={`protocol-chip shrink-0 px-1.5 py-0.5 text-[0.62rem] ${tone.chip}`}>
                      {threat.severity}
                    </span>
                  </div>
                  <div className="mono grid gap-2 text-xs text-[var(--muted)] md:grid-cols-4">
                    <Meta icon={<Users className="h-3.5 w-3.5" />} label={threat.target} />
                    <Meta icon={<Shield className="h-3.5 w-3.5" />} label={threat.vector} />
                    <Meta icon={<AlertTriangle className="h-3.5 w-3.5" />} label={`${threat.reports} reports`} />
                    <Meta icon={<Clock className="h-3.5 w-3.5" />} label={formatDate(threat.timestamp)} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 content-start">
          <SelectedThreat threat={selectedThreat} />
          <div className="terminal-panel scroll-reveal p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="panel-kicker flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Before you act
              </h3>
              <span className="protocol-chip active px-2 py-0.5">VERIFY</span>
            </div>
            <p className="text-sm leading-6 text-[var(--green-soft)]">Do not use the links, numbers, or names in a scenario as evidence that something is safe or dangerous. Verify the exact contact using a trusted official source.</p>
            <a className="inline-link mt-3" href="https://semakmule.rmp.gov.my" target="_blank" rel="noreferrer">Open PDRM Semak Mule <span aria-hidden="true">→</span></a>
          </div>
        </div>

        <PatternWall patterns={patterns} />
      </section>
    </div>
  );
}

function SelectedThreat({ threat }: { threat: Threat | null }) {
  if (!threat) {
    return (
      <div className="terminal-panel scroll-reveal p-4">
        <p className="mono text-sm text-[var(--muted)]">No threat selected.</p>
      </div>
    );
  }

  const tone = severityTone(threat.severity);

  return (
    <div className="terminal-panel hot scroll-reveal">
      <div className="panel-title px-4 py-3">
        <span>Scenario notes</span>
        <span className={`protocol-chip px-2 py-0.5 ${tone.chip}`}>{threat.severity}</span>
      </div>
      <div className="p-4">
        <h3 className={`mono text-xl font-black ${tone.text}`}>{threat.title}</h3>
        <p className="mono mt-2 text-xs leading-5 text-[var(--green-soft)]">{threat.description}</p>
        <div className="mono mt-4 grid gap-3 text-xs">
          <DetailRow label="Target" value={threat.target} />
          <DetailRow label="Vector" value={threat.vector} />
          <DetailRow label="Reports" value={String(threat.reports)} />
          <DetailRow label="Example date" value={formatDate(threat.timestamp)} />
          <DetailRow label="Use" value="LEARNING ONLY" />
        </div>
      </div>
    </div>
  );
}

function PatternWall({ patterns }: { patterns: Pattern[] }) {
  const max = Math.max(...patterns.map(pattern => pattern.keyword_count), 1);

  return (
    <div className="terminal-panel scroll-reveal">
      <div className="panel-title px-4 py-3">
        <span className="flex items-center gap-2">
          <Radio className="h-4 w-4" />
          Pattern guide
        </span>
        <span className="protocol-chip active px-2 py-0.5">MY</span>
      </div>
      <div className="divide-y divide-[var(--line-dim)]">
        {patterns.map(pattern => {
          const tone = severityTone(pattern.severity);
          const width = `${Math.max(8, Math.round((pattern.keyword_count / max) * 100))}%`;
          return (
            <div key={pattern.name} className="p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className={`mono min-w-0 text-sm font-black ${tone.text}`}>{formatName(pattern.name)}</h3>
                <span className={`protocol-chip shrink-0 px-1.5 py-0.5 text-[0.62rem] ${tone.chip}`}>
                  {pattern.severity}
                </span>
              </div>
              <p className="mono mb-3 text-xs leading-5 text-[var(--muted)]">{pattern.description}</p>
              <div className="rank-bar">
                <span style={{ width }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {pattern.sample_keywords.slice(0, 3).map(keyword => (
                  <span key={keyword} className="protocol-chip px-1.5 py-0.5 text-[0.62rem]">
                    {keyword}
                  </span>
                ))}
                {pattern.keyword_count > 3 && (
                  <span className="mono px-1 py-0.5 text-[0.62rem] font-black text-[var(--amber)]">
                    +{pattern.keyword_count - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--line-dim)] pb-2 last:border-0">
      <span className="font-black uppercase text-[var(--muted)]">{label}</span>
      <span className="text-right font-black text-[var(--amber)]">{value}</span>
    </div>
  );
}

function Meta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      {icon}
      <span className="truncate">{label}</span>
    </span>
  );
}

function severityTone(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return {
        text: 'text-[var(--red)]',
        chip: 'border-[var(--red)] text-[var(--red)]',
      };
    case 'high':
      return {
        text: 'text-[var(--amber)]',
        chip: 'border-[var(--amber)] text-[var(--amber)]',
      };
    case 'medium':
      return {
        text: 'text-[var(--cyan)]',
        chip: 'border-[var(--cyan)] text-[var(--cyan)]',
      };
    default:
      return {
        text: 'text-[var(--green)]',
        chip: 'border-[var(--green)] text-[var(--green)]',
      };
  }
}

function formatName(name: string) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-MY', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
