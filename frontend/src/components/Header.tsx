import { Activity, BarChart3, FileText, Radio, ScanLine, Search, Shield, Swords } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Header({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const [modelStatus, setModelStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  useEffect(() => {
    api.health()
      .then(h => setModelStatus(h.model_loaded ? 'online' : 'offline'))
      .catch(() => setModelStatus('offline'));
  }, []);

  const tabs = [
    { id: 'analyzer', label: 'Scan', icon: Search },
    { id: 'dashboard', label: 'Stats', icon: BarChart3 },
    { id: 'threats', label: 'Feed', icon: Radio },
    { id: 'report', label: 'Report', icon: FileText },
    { id: 'cybersquad', label: 'Squad', icon: Swords },
  ];

  const statusTone = {
    online: 'text-[var(--green)]',
    offline: 'text-[var(--red)]',
    loading: 'text-[var(--amber)]',
  }[modelStatus];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line-dim)] bg-[#050605]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-3 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[4px] border border-[var(--line)] bg-[rgba(101,255,105,0.08)] text-[var(--green)] shadow-[0_0_18px_rgba(101,255,105,0.12)]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="glow-title flex items-center gap-2 text-lg leading-none">
                PHISHGUARD MY
                <span className="protocol-chip px-1.5 py-0.5 text-[0.58rem]">v1</span>
              </div>
              <div className="mono mt-1 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--muted)]">
                <ScanLine className="h-3 w-3" />
                scam knock monitor
              </div>
            </div>
          </div>

          <div className={`mono flex items-center gap-2 border border-[var(--line-dim)] bg-black/35 px-2.5 py-1.5 text-xs font-black uppercase lg:hidden ${statusTone}`}>
            <span className="status-dot" />
            {modelStatus === 'online' ? 'ready' : modelStatus}
          </div>
        </div>

        <nav className="grid grid-cols-5 gap-2 lg:flex lg:items-center">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              icon={tab.icon}
              label={tab.label}
              onClick={() => onTabChange(tab.id)}
            />
          ))}
        </nav>

        <div className={`mono hidden items-center gap-3 border border-[var(--line-dim)] bg-black/35 px-3 py-2 text-xs font-black uppercase tracking-[0.1em] lg:flex ${statusTone}`}>
          <Activity className="h-4 w-4" />
          <span className="status-dot" />
          <span>{modelStatus === 'online' ? 'model ready' : modelStatus === 'offline' ? 'model offline' : 'linking'}</span>
        </div>
      </div>
    </header>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Search;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`mono flex min-h-10 items-center justify-center gap-2 border px-3 text-xs font-black uppercase tracking-[0.12em] transition ${
        active
          ? 'border-[var(--amber)] bg-[var(--amber)] text-black shadow-[0_0_18px_rgba(255,211,90,0.24)]'
          : 'border-[var(--line-dim)] bg-black/35 text-[var(--muted)] hover:border-[var(--green)] hover:text-[var(--green)]'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
