import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Header from './components/Header';

const Analyzer = lazy(() => import('./components/Analyzer'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ThreatFeed = lazy(() => import('./components/ThreatFeed'));
const Report = lazy(() => import('./components/Report'));
const CyberSquad = lazy(() => import('./components/CyberSquad'));
const ActionPlan = lazy(() => import('./components/ActionPlan'));
const Learn = lazy(() => import('./components/Learn'));
const Events = lazy(() => import('./components/Events'));

function App() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const mainRef = useRef<HTMLElement>(null);

  const navigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
  };

  useEffect(() => {
    const labels: Record<string, string> = {
      analyzer: 'Check a scam', learn: 'Learn', threats: 'Scam library', report: 'Contribute',
      cybersquad: 'Campus challenge', action: 'Urgent help', dashboard: 'Practice data', events: 'Events',
    };
    document.title = `${labels[activeTab] ?? 'PhishGuard'} — PhishGuard MY`;
  }, [activeTab]);

  return (
    <div className="app-chrome min-h-screen text-[var(--ink)]">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="scroll-progress" />
      <Header activeTab={activeTab} onTabChange={navigate} onGetHelp={() => navigate('action')} />
      <main id="main-content" ref={mainRef} tabIndex={-1} className="px-4 py-7 outline-none sm:px-6 lg:px-8 lg:py-10">
        <Suspense fallback={<LoadingView />}>
          {activeTab === 'analyzer' && <Analyzer onGetHelp={() => navigate('action')} onNavigate={navigate} />}
          {activeTab === 'learn' && <Learn onNavigate={navigate} />}
          {activeTab === 'events' && <Events onNavigate={navigate} />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'threats' && <ThreatFeed />}
          {activeTab === 'report' && <Report />}
          {activeTab === 'cybersquad' && <CyberSquad />}
          {activeTab === 'action' && <ActionPlan onNavigate={navigate} />}
        </Suspense>
      </main>
      <footer className="site-footer px-4 py-10 text-center">
        <p className="footer-mission mx-auto max-w-2xl text-base font-black text-white">
          A student-led movement to help each other spot scams before the next click.
        </p>
        <p className="mt-2 text-sm font-bold text-[var(--green)]">
          PhishGuard MY · by students, for students
        </p>
        <p className="mx-auto mt-3 max-w-3xl text-xs leading-5 text-[var(--muted)]">
          This tool supports safer decisions; it is not a guarantee, bank, law-enforcement service, or official reporting channel. Never share passwords, OTPs, TACs, PINs, or card details.
        </p>
      </footer>
    </div>
  );
}

function LoadingView() {
  return <div className="flex h-72 items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-[rgba(101,255,105,0.28)] border-t-[var(--green)] animate-spin" /></div>;
}

export default App;
