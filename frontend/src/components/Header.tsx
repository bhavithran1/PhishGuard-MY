import { BookOpen, FileText, HeartHandshake, Radio, ScanLine, Search, Shield, Swords } from 'lucide-react';

export default function Header({
  activeTab,
  onTabChange,
  onGetHelp,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onGetHelp: () => void;
}) {
  const tabs = [
    { id: 'analyzer', label: 'Check', icon: Search },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'threats', label: 'Alerts', icon: Radio },
    { id: 'report', label: 'Report', icon: FileText },
    { id: 'cybersquad', label: 'Campus', icon: Swords },
  ];

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
                <span className="protocol-chip px-1.5 py-0.5 text-[0.58rem]">STUDENT EDITION</span>
              </div>
              <div className="mono mt-1 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--muted)]">
                <ScanLine className="h-3 w-3" />
                semak dulu · bantu kawan · lindungi komuniti
              </div>
            </div>
          </div>

          <button onClick={onGetHelp} className="button-primary header-mobile-help min-h-9 px-3 text-[0.68rem]">
            Get help now
          </button>
        </div>

        <nav className="grid grid-cols-5 gap-1.5 lg:flex lg:items-center">
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

        <button onClick={onGetHelp} className="button-primary header-desktop-help min-h-10 px-4 text-xs">
          <HeartHandshake className="h-4 w-4" />
          I sent money / need help
        </button>
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
