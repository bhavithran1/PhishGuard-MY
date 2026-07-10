import { lazy, Suspense, useState } from 'react';
import Header from './components/Header';

const Analyzer = lazy(() => import('./components/Analyzer'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ThreatFeed = lazy(() => import('./components/ThreatFeed'));
const Report = lazy(() => import('./components/Report'));
const CyberSquad = lazy(() => import('./components/CyberSquad'));
const ActionPlan = lazy(() => import('./components/ActionPlan'));
const Learn = lazy(() => import('./components/Learn'));

function App() {
  const [activeTab, setActiveTab] = useState('analyzer');

  return (
    <div className="app-chrome min-h-screen text-[var(--ink)]">
      <div className="scroll-progress" />
      <Header activeTab={activeTab} onTabChange={setActiveTab} onGetHelp={() => setActiveTab('action')} />
      <main className="px-3 py-5 sm:px-5 lg:px-7">
        <Suspense fallback={<LoadingView />}>
          {activeTab === 'analyzer' && <Analyzer onGetHelp={() => setActiveTab('action')} />}
          {activeTab === 'learn' && <Learn onNavigate={setActiveTab} />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'threats' && <ThreatFeed />}
          {activeTab === 'report' && <Report />}
          {activeTab === 'cybersquad' && <CyberSquad />}
          {activeTab === 'action' && <ActionPlan onNavigate={setActiveTab} />}
        </Suspense>
      </main>
      <footer className="border-t border-[var(--line-dim)] bg-black/15 px-4 py-7 text-center">
        <p className="mono text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[var(--green-soft)]">
          PhishGuard MY · a student-led learning and prevention project
        </p>
        <p className="mx-auto mt-2 max-w-3xl text-xs leading-5 text-[var(--muted)]">
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
