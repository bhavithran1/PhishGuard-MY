import { useState, useEffect, useCallback } from 'react';
import {
  Award, ChevronRight, Crown, Flag, Gamepad2, GraduationCap,
  Shield, Swords, Target, Timer, Trophy, Users, Zap,
} from 'lucide-react';
import { api } from '../api';

interface Challenge {
  id: string;
  type: string;
  content: string;
  is_scam: boolean;
  explanation: string;
}

interface Hunter {
  rank: number;
  handle: string;
  university: string;
  xp: number;
  badge: string;
  scams_caught: number;
}

interface University {
  name: string;
  code: string;
  city: string;
  members: number;
  scams_reported: number;
  challenges_completed: number;
  rank: number;
}

type View = 'home' | 'challenge' | 'leaderboard';

const RANKS = [
  { name: 'Recruit', minXP: 0, color: 'var(--muted)' },
  { name: 'Analyst', minXP: 1000, color: 'var(--cyan)' },
  { name: 'Hunter', minXP: 3000, color: 'var(--green)' },
  { name: 'Sentinel', minXP: 7000, color: 'var(--amber)' },
  { name: 'Guardian', minXP: 12000, color: 'var(--magenta)' },
];

export default function CyberSquad() {
  const [view, setView] = useState<View>('home');

  return (
    <div className="mx-auto max-w-[1500px]">
      {view === 'home' && <HomeView onNavigate={setView} />}
      {view === 'challenge' && <ChallengeView onBack={() => setView('home')} />}
      {view === 'leaderboard' && <LeaderboardView onBack={() => setView('home')} />}
    </div>
  );
}

function HomeView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [stats, setStats] = useState<{ total_members: number; total_scams_reported: number; total_challenges: number } | null>(null);

  useEffect(() => {
    api.getCyberSquadLeaderboard().then(setStats).catch(console.error);
  }, []);

  return (
    <>
      <section className="scroll-reveal flex flex-col gap-4 border-b border-[var(--line-dim)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="panel-kicker">Student-led practice space</p>
          <h2 className="glow-title mt-2 text-4xl sm:text-5xl">CYBERSQUAD MY</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            A prototype for peer-led scam awareness: learn patterns, practise spotting them, and build a healthier reporting culture on campus.
          </p>
        </div>
        <div className="mono flex w-fit items-center gap-2 border border-[var(--line)] bg-black/40 px-3 py-2 text-xs font-black uppercase text-[var(--green)]">
          <span className="status-dot" />
          {stats ? `${stats.total_members.toLocaleString()} demo participants` : 'loading'}
        </div>
      </section>

      {/* Stats Bar */}
      {stats && (
        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <StatCard icon={<Users className="h-5 w-5" />} label="Active hunters" value={stats.total_members.toLocaleString()} tone="text-[var(--green)]" />
          <StatCard icon={<Flag className="h-5 w-5" />} label="Scams reported" value={stats.total_scams_reported.toLocaleString()} tone="text-[var(--amber)]" />
          <StatCard icon={<Target className="h-5 w-5" />} label="Challenges completed" value={stats.total_challenges.toLocaleString()} tone="text-[var(--cyan)]" />
        </section>
      )}

      {/* Action Cards */}
      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <button onClick={() => onNavigate('challenge')} className="terminal-panel hot scroll-reveal group p-6 text-left transition hover:scale-[1.01]">
          <div className="mb-4 grid h-12 w-12 place-items-center border border-[var(--amber)] bg-black/50 text-[var(--amber)]">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <h3 className="glow-title text-2xl">SPOT THE PHISH</h3>
          <p className="mono mt-2 text-sm text-[var(--green-soft)]">
            Interactive challenge — classify URLs and messages as scam or legit.
            Build pattern recognition with immediate explanations — no real malicious links are opened.
          </p>
          <div className="mono mt-4 flex items-center gap-2 text-xs font-black uppercase text-[var(--amber)] transition group-hover:gap-3">
            Start challenge <ChevronRight className="h-4 w-4" />
          </div>
        </button>

        <button onClick={() => onNavigate('leaderboard')} className="terminal-panel scroll-reveal group p-6 text-left transition hover:scale-[1.01]">
          <div className="mb-4 grid h-12 w-12 place-items-center border border-[var(--green)] bg-black/50 text-[var(--green)]">
            <Trophy className="h-6 w-6" />
          </div>
          <h3 className="glow-title text-2xl">SAMPLE SCOREBOARD</h3>
          <p className="mono mt-2 text-sm text-[var(--green-soft)]">
            A sample of how a future campus programme could recognise learning and community contribution. Names and scores are illustrative.
          </p>
          <div className="mono mt-4 flex items-center gap-2 text-xs font-black uppercase text-[var(--green)] transition group-hover:gap-3">
            View rankings <ChevronRight className="h-4 w-4" />
          </div>
        </button>
      </section>

      {/* How it Works */}
      <section className="mt-5 terminal-panel scroll-reveal p-6">
        <div className="panel-title px-0 pb-3 mb-4">
          <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> How CyberSquad works</span>
          <span className="protocol-chip px-2 py-0.5">PILOT</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Step num="01" title="Learn" desc="Start with short lessons and take the Spot the Phish drill at your own pace." />
          <Step num="02" title="Discuss" desc="Compare reasoning with peers. Focus on cues, not on blaming people who were targeted." />
          <Step num="03" title="Verify" desc="Use official channels before a transaction or whenever there is a possible loss." />
          <Step num="04" title="Support" desc="Help your campus share accurate, privacy-respecting scam prevention guidance." />
        </div>
      </section>

      {/* Rank System */}
      <section className="mt-5 terminal-panel scroll-reveal p-6">
        <div className="panel-title px-0 pb-3 mb-4">
          <span className="flex items-center gap-2"><Award className="h-4 w-4" /> Rank progression</span>
          <span className="protocol-chip px-2 py-0.5">XP</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-5">
          {RANKS.map(rank => (
            <div key={rank.name} className="border border-[var(--line-dim)] bg-black/30 p-4 text-center">
              <Shield className="mx-auto h-8 w-8" style={{ color: rank.color }} />
              <div className="mono mt-2 text-sm font-black uppercase" style={{ color: rank.color }}>
                {rank.name}
              </div>
              <div className="mono mt-1 text-xs text-[var(--muted)]">{rank.minXP.toLocaleString()}+ XP</div>
            </div>
          ))}
        </div>
      </section>

      {/* University Network */}
      <section className="mt-5 terminal-panel scroll-reveal p-6">
        <div className="panel-title px-0 pb-3 mb-4">
          <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> University network</span>
          <span className="protocol-chip active px-2 py-0.5">PILOT IDEA</span>
        </div>
        <p className="mono mb-4 text-sm text-[var(--green-soft)]">
          A future rollout could bring together student societies across Malaysian campuses. These names are planning examples, not participating organisations or active nodes.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {['UM — Kuala Lumpur', 'UTM — Johor Bahru', 'UKM — Bangi', 'USM — Penang', 'UPM — Serdang', 'UiTM — Shah Alam', 'IIUM — Gombak', 'MMU — Cyberjaya'].map(uni => (
            <div key={uni} className="mono flex items-center gap-2 border border-[var(--line-dim)] bg-black/30 px-3 py-2 text-xs font-bold text-[var(--green-soft)]">
              <span className="status-dot text-[var(--green)]" style={{ width: '0.4rem', height: '0.4rem' }} />
              {uni}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ChallengeView({ onBack }: { onBack: () => void }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCyberSquadChallenge()
      .then(data => setChallenges(data.challenges))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || finished || challenges.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setFinished(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, finished, challenges.length]);

  const handleAnswer = useCallback((userSaysScam: boolean) => {
    const challenge = challenges[current];
    const correct = userSaysScam === challenge.is_scam;
    setAnswer(userSaysScam);
    setShowResult(true);
    if (correct) {
      const streakBonus = Math.min(streak, 4) * 10;
      setScore(prev => prev + 100 + streakBonus);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  }, [challenges, current, streak]);

  const nextChallenge = () => {
    if (current + 1 >= challenges.length) {
      setFinished(true);
    } else {
      setCurrent(prev => prev + 1);
      setAnswer(null);
      setShowResult(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[rgba(101,255,105,0.28)] border-t-[var(--green)] animate-spin" />
      </div>
    );
  }

  if (finished) {
    const maxScore = challenges.length * 100;
    const pct = Math.round((score / maxScore) * 100);
    const xpEarned = score + (timeLeft * 2);
    return (
      <div className="mx-auto max-w-2xl">
        <div className="terminal-panel hot scroll-reveal p-8 text-center">
          <Trophy className="mx-auto h-16 w-16 text-[var(--amber)]" />
          <h2 className="glow-title mt-4 text-4xl">MISSION COMPLETE</h2>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="border border-[var(--line-dim)] bg-black/40 p-4">
              <div className="mono text-3xl font-black text-[var(--green)]">{score}</div>
              <div className="mono mt-1 text-xs text-[var(--muted)]">Score</div>
            </div>
            <div className="border border-[var(--line-dim)] bg-black/40 p-4">
              <div className="mono text-3xl font-black text-[var(--amber)]">{pct}%</div>
              <div className="mono mt-1 text-xs text-[var(--muted)]">Accuracy</div>
            </div>
            <div className="border border-[var(--line-dim)] bg-black/40 p-4">
              <div className="mono text-3xl font-black text-[var(--cyan)]">+{xpEarned}</div>
              <div className="mono mt-1 text-xs text-[var(--muted)]">XP earned</div>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => { setCurrent(0); setScore(0); setStreak(0); setTimeLeft(60); setFinished(false); setShowResult(false); setAnswer(null); }} className="button-primary min-h-11 px-5 text-sm">
              Play again
            </button>
            <button onClick={onBack} className="button-ghost min-h-11 px-5 text-sm">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const challenge = challenges[current];

  return (
    <>
      <section className="scroll-reveal flex flex-col gap-4 border-b border-[var(--line-dim)] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="button-ghost min-h-9 px-3 text-xs">Back</button>
          <div>
            <h2 className="glow-title text-2xl">SPOT THE PHISH</h2>
            <p className="mono text-xs text-[var(--muted)]">Is this a scam or legit? Choose wisely.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="mono flex items-center gap-2 border border-[var(--line-dim)] bg-black/40 px-3 py-2 text-xs font-black">
            <Swords className="h-4 w-4 text-[var(--amber)]" />
            <span className="text-[var(--green)]">{score}</span> pts
          </div>
          <div className="mono flex items-center gap-2 border border-[var(--line-dim)] bg-black/40 px-3 py-2 text-xs font-black">
            <Zap className="h-4 w-4 text-[var(--cyan)]" />
            <span className="text-[var(--cyan)]">{streak}</span> streak
          </div>
          <div className={`mono flex items-center gap-2 border bg-black/40 px-3 py-2 text-xs font-black ${
            timeLeft <= 10 ? 'border-[var(--red)] text-[var(--red)]' : 'border-[var(--line-dim)] text-[var(--green)]'
          }`}>
            <Timer className="h-4 w-4" />
            {timeLeft}s
          </div>
        </div>
      </section>

      {/* Progress */}
      <div className="mt-4 flex items-center gap-2">
        {challenges.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${
            i < current ? 'bg-[var(--green)]' :
            i === current ? 'bg-[var(--amber)]' : 'bg-[rgba(255,255,255,0.08)]'
          }`} />
        ))}
        <span className="mono text-xs text-[var(--muted)]">{current + 1}/{challenges.length}</span>
      </div>

      {/* Challenge Card */}
      <div className="mt-5 terminal-panel p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="protocol-chip px-2 py-0.5 text-xs">{challenge.type.toUpperCase()}</span>
          <span className="mono text-xs text-[var(--muted)]">// classify this sample</span>
        </div>
        <div className="rounded border border-[var(--line-dim)] bg-black/60 px-5 py-4">
          <p className="mono text-sm leading-7 text-[var(--ink)] break-all">{challenge.content}</p>
        </div>

        {!showResult ? (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button onClick={() => handleAnswer(true)} className="flex min-h-14 flex-col items-center justify-center gap-1 border border-[var(--red)] bg-[rgba(255,77,77,0.08)] text-[var(--red)] transition hover:bg-[rgba(255,77,77,0.15)]">
              <span className="mono text-lg font-black">SCAM</span>
              <span className="mono text-xs opacity-60">This is phishing</span>
            </button>
            <button onClick={() => handleAnswer(false)} className="flex min-h-14 flex-col items-center justify-center gap-1 border border-[var(--green)] bg-[rgba(101,255,105,0.08)] text-[var(--green)] transition hover:bg-[rgba(101,255,105,0.15)]">
              <span className="mono text-lg font-black">LEGIT</span>
              <span className="mono text-xs opacity-60">This is safe</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 animate-slide-up">
            <div className={`rounded border p-4 ${
              answer === challenge.is_scam
                ? 'border-[var(--green)] bg-[rgba(101,255,105,0.08)]'
                : 'border-[var(--red)] bg-[rgba(255,77,77,0.08)]'
            }`}>
              <div className="mono flex items-center gap-2 text-sm font-black">
                {answer === challenge.is_scam ? (
                  <span className="text-[var(--green)]">CORRECT +{100 + Math.min(streak - 1, 3) * 10}</span>
                ) : (
                  <span className="text-[var(--red)]">WRONG — streak broken</span>
                )}
              </div>
              <p className="mono mt-2 text-xs leading-5 text-[var(--green-soft)]">{challenge.explanation}</p>
              <div className="mono mt-2 text-xs text-[var(--muted)]">
                Verdict: {challenge.is_scam ? 'This was a SCAM' : 'This was LEGITIMATE'}
              </div>
            </div>
            <button onClick={nextChallenge} className="button-primary mt-4 min-h-11 w-full px-5 text-sm">
              {current + 1 >= challenges.length ? 'See results' : 'Next challenge'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function LeaderboardView({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<{ hunters: Hunter[]; universities: University[] } | null>(null);
  const [tab, setTab] = useState<'hunters' | 'universities'>('universities');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCyberSquadLeaderboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[rgba(101,255,105,0.28)] border-t-[var(--green)] animate-spin" />
      </div>
    );
  }

  const badgeColor = (badge: string) => ({
    guardian: 'var(--magenta)',
    sentinel: 'var(--amber)',
    hunter: 'var(--green)',
    analyst: 'var(--cyan)',
    recruit: 'var(--muted)',
  }[badge] || 'var(--muted)');

  return (
    <>
      <section className="scroll-reveal flex flex-col gap-4 border-b border-[var(--line-dim)] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="button-ghost min-h-9 px-3 text-xs">Back</button>
          <div>
            <h2 className="glow-title text-2xl">LEADERBOARD</h2>
            <p className="mono text-xs text-[var(--muted)]">University and hunter rankings across Malaysia</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('universities')} className={`mono min-h-9 border px-3 text-xs font-black uppercase ${tab === 'universities' ? 'border-[var(--amber)] bg-[var(--amber)] text-black' : 'border-[var(--line-dim)] text-[var(--muted)] hover:border-[var(--green)]'}`}>
            <GraduationCap className="mr-1.5 inline h-3.5 w-3.5" /> Universities
          </button>
          <button onClick={() => setTab('hunters')} className={`mono min-h-9 border px-3 text-xs font-black uppercase ${tab === 'hunters' ? 'border-[var(--amber)] bg-[var(--amber)] text-black' : 'border-[var(--line-dim)] text-[var(--muted)] hover:border-[var(--green)]'}`}>
            <Swords className="mr-1.5 inline h-3.5 w-3.5" /> Top hunters
          </button>
        </div>
      </section>

      <div className="mt-5">
        {tab === 'universities' ? (
          <div className="grid gap-3">
            {data.universities.map((uni, i) => (
              <div key={uni.code} className={`terminal-panel scroll-reveal flex items-center gap-4 p-4 ${i === 0 ? 'hot' : ''}`}>
                <div className={`mono grid h-11 w-11 shrink-0 place-items-center border text-lg font-black ${
                  i === 0 ? 'border-[var(--amber)] text-[var(--amber)]' :
                  i === 1 ? 'border-[var(--green-soft)] text-[var(--green-soft)]' :
                  i === 2 ? 'border-[var(--orange)] text-[var(--orange)]' :
                  'border-[var(--line-dim)] text-[var(--muted)]'
                }`}>
                  {i === 0 ? <Crown className="h-6 w-6" /> : `#${uni.rank}`}
                </div>
                <div className="flex-1">
                  <div className="mono flex items-center gap-2 text-sm font-black text-[var(--ink)]">
                    {uni.code}
                    <span className="text-xs font-normal text-[var(--muted)]">— {uni.name}</span>
                  </div>
                  <div className="mono mt-1 text-xs text-[var(--muted)]">{uni.city}</div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="mono text-lg font-black text-[var(--green)]">{uni.members}</div>
                    <div className="mono text-[0.6rem] uppercase text-[var(--muted)]">Members</div>
                  </div>
                  <div>
                    <div className="mono text-lg font-black text-[var(--amber)]">{uni.scams_reported.toLocaleString()}</div>
                    <div className="mono text-[0.6rem] uppercase text-[var(--muted)]">Reports</div>
                  </div>
                  <div>
                    <div className="mono text-lg font-black text-[var(--cyan)]">{uni.challenges_completed.toLocaleString()}</div>
                    <div className="mono text-[0.6rem] uppercase text-[var(--muted)]">Challenges</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {data.hunters.map((hunter, i) => (
              <div key={hunter.handle} className={`terminal-panel scroll-reveal flex items-center gap-4 p-4 ${i === 0 ? 'hot' : ''}`}>
                <div className={`mono grid h-11 w-11 shrink-0 place-items-center border text-lg font-black ${
                  i === 0 ? 'border-[var(--amber)] text-[var(--amber)]' :
                  i === 1 ? 'border-[var(--green-soft)] text-[var(--green-soft)]' :
                  i === 2 ? 'border-[var(--orange)] text-[var(--orange)]' :
                  'border-[var(--line-dim)] text-[var(--muted)]'
                }`}>
                  {i === 0 ? <Crown className="h-6 w-6" /> : `#${hunter.rank}`}
                </div>
                <div className="flex-1">
                  <div className="mono flex items-center gap-2 text-sm font-black text-[var(--ink)]">
                    {hunter.handle}
                    <span className="mono rounded-sm px-1.5 py-0.5 text-[0.6rem] font-black uppercase" style={{ color: badgeColor(hunter.badge), border: `1px solid ${badgeColor(hunter.badge)}`, background: 'rgba(0,0,0,0.4)' }}>
                      {hunter.badge}
                    </span>
                  </div>
                  <div className="mono mt-1 text-xs text-[var(--muted)]">{hunter.university}</div>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="mono text-lg font-black text-[var(--amber)]">{hunter.xp.toLocaleString()}</div>
                    <div className="mono text-[0.6rem] uppercase text-[var(--muted)]">XP</div>
                  </div>
                  <div>
                    <div className="mono text-lg font-black text-[var(--green)]">{hunter.scams_caught}</div>
                    <div className="mono text-[0.6rem] uppercase text-[var(--muted)]">Catches</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="terminal-panel scroll-reveal flex items-center gap-4 p-4">
      <div className={`grid h-10 w-10 shrink-0 place-items-center border border-[var(--line-dim)] bg-black/40 ${tone}`}>
        {icon}
      </div>
      <div>
        <div className={`mono text-2xl font-black ${tone}`}>{value}</div>
        <div className="mono text-xs uppercase text-[var(--muted)]">{label}</div>
      </div>
    </div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="border border-[var(--line-dim)] bg-black/30 p-4">
      <div className="mono text-xs font-black text-[var(--amber)]">{num}</div>
      <div className="mono mt-1 text-sm font-black uppercase text-[var(--green)]">{title}</div>
      <p className="mono mt-2 text-xs leading-5 text-[var(--muted)]">{desc}</p>
    </div>
  );
}
