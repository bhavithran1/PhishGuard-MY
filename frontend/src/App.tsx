import { useState } from 'react';
import Header from './components/Header';
import Analyzer from './components/Analyzer';
import Dashboard from './components/Dashboard';
import ThreatFeed from './components/ThreatFeed';
import Report from './components/Report';
import CyberSquad from './components/CyberSquad';

function App() {
  const [activeTab, setActiveTab] = useState('analyzer');

  return (
    <div className="app-chrome min-h-screen text-[var(--ink)]">
      <div className="scroll-progress" />
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="px-3 py-5 sm:px-5 lg:px-7">
        {activeTab === 'analyzer' && <Analyzer />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'threats' && <ThreatFeed />}
        {activeTab === 'report' && <Report />}
        {activeTab === 'cybersquad' && <CyberSquad />}
      </main>
      <footer className="mono border-t border-[var(--line-dim)] px-4 py-4 text-center text-[0.7rem] uppercase tracking-[0.18em] text-[var(--muted)]">
        PhishGuard MY // passive scam telemetry // analyst console
      </footer>
    </div>
  );
}

export default App;
