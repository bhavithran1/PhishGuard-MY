import { BookOpen, CalendarDays, FileText, HeartHandshake, Radio, Search, ShieldCheck, Trophy } from 'lucide-react';

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
    { id: 'analyzer', label: 'Check a scam', icon: Search },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'threats', label: 'Scam library', icon: Radio },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'report', label: 'Contribute', icon: FileText },
    { id: 'cybersquad', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-base font-black leading-none text-[var(--ink)]">
                PhishGuard <span className="text-[var(--green)]">MY</span>
                <span className="brand-chip">For students</span>
              </div>
              <div className="mt-1 text-[0.68rem] font-semibold text-[var(--muted)]">
                By students, for students
              </div>
            </div>
          </div>

          <button onClick={onGetHelp} className="button-primary header-mobile-help min-h-9 px-3 text-[0.68rem]">
            Get help now
          </button>
        </div>

        <nav aria-label="Primary navigation" className="nav-shell mobile-dock grid grid-cols-6 gap-1 lg:flex lg:items-center">
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
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={`nav-item flex min-h-10 items-center justify-center gap-2 px-3 text-xs font-bold transition ${
        active
          ? 'active text-[var(--ink)]'
          : 'text-[var(--muted)] hover:text-[var(--ink)]'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
