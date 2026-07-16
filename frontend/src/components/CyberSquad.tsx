import { useState, useEffect, useCallback } from 'react';
import {
  Banknote, ChevronRight, Crown, Gamepad2, GraduationCap, Medal,
  ShieldCheck, Sparkles, Swords, Timer, Trophy, UserPlus, Users, Zap,
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
type StudentProfile = { handle: string; campus: string; xp: number };

const RANKS = [
  { name: 'Recruit', minXP: 0, color: 'var(--muted)' },
  { name: 'Analyst', minXP: 1000, color: 'var(--cyan)' },
  { name: 'Hunter', minXP: 3000, color: 'var(--green)' },
  { name: 'Sentinel', minXP: 7000, color: 'var(--amber)' },
  { name: 'Guardian', minXP: 12000, color: 'var(--magenta)' },
];

export default function CyberSquad() {
  const [view, setView] = useState<View>('home');
  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    try { return JSON.parse(localStorage.getItem('phishguard-student-profile') || 'null'); }
    catch { return null; }
  });

  const saveProfile = (next: StudentProfile) => {
    setProfile(next);
    localStorage.setItem('phishguard-student-profile', JSON.stringify(next));
  };

  const addXP = (xp: number) => {
    if (profile) saveProfile({ ...profile, xp: profile.xp + xp });
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      {view === 'home' && <HomeView onNavigate={setView} profile={profile} onSaveProfile={saveProfile} />}
      {view === 'challenge' && <ChallengeView onBack={() => setView('home')} profile={profile} onEarnXP={addXP} />}
      {view === 'leaderboard' && <LeaderboardView onBack={() => setView('home')} />}
    </div>
  );
}

function HomeView({ onNavigate, profile, onSaveProfile }: { onNavigate: (v: View) => void; profile: StudentProfile | null; onSaveProfile: (profile: StudentProfile) => void }) {
  return (
    <>
      <section className="scroll-reveal flex flex-col gap-4 border-b border-[var(--line-dim)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="panel-kicker">Learn. Contribute. Earn.</p>
          <h1 className="glow-title mt-2 text-4xl sm:text-5xl">Student Scam Fighters</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            Turn cybersecurity skills into real community impact. Complete challenges, share verified scam signals, and rise through the campus leaderboard.
          </p>
        </div>
        <div className="mono flex w-fit items-center gap-2 border border-[var(--line)] bg-black/40 px-3 py-2 text-xs font-black uppercase text-[var(--green)]">
          <span className="status-dot" />
          Demo programme
        </div>
      </section>

      <section className="prize-banner mt-5 scroll-reveal">
        <div className="prize-copy">
          <div className="prize-icon"><Banknote className="h-7 w-7" /></div>
          <div><p className="eyebrow">Proposed sponsored pilot</p><h3>RM1,000 monthly prize pool</h3><p>Illustrative until a sponsor, dates and eligibility rules are confirmed. Rewards useful learning and verified, privacy-safe contributions—not risky confrontation.</p></div>
        </div>
        <div className="prize-podium">
          <div><Medal className="h-4 w-4" /><span>1st</span><strong>RM500</strong></div>
          <div><Medal className="h-4 w-4" /><span>2nd</span><strong>RM300</strong></div>
          <div><Medal className="h-4 w-4" /><span>3rd</span><strong>RM200</strong></div>
        </div>
        <button onClick={() => onNavigate('leaderboard')} className="button-primary min-h-11 px-4 text-xs">View leaderboard <ChevronRight className="h-4 w-4" /></button>
      </section>

      <StudentProfileCard profile={profile} onSave={onSaveProfile} onStart={() => onNavigate('challenge')} />

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
          <h3 className="glow-title text-2xl">PRIZE LEADERBOARD</h3>
          <p className="mono mt-2 text-sm text-[var(--green-soft)]">
            See who is leading this month and what it takes to earn a verified place. Current names and scores are illustrative pilot data.
          </p>
          <div className="mono mt-4 flex items-center gap-2 text-xs font-black uppercase text-[var(--green)] transition group-hover:gap-3">
            View rankings <ChevronRight className="h-4 w-4" />
          </div>
        </button>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-3">
        <TrustRule icon={<ShieldCheck className="h-5 w-5" />} title="Verified, not viral" desc="Points count only after a contribution passes privacy, quality, and duplication checks." />
        <TrustRule icon={<Sparkles className="h-5 w-5" />} title="Skill over volume" desc="Accurate reasoning and completed learning matter more than flooding the platform with reports." />
        <TrustRule icon={<Users className="h-5 w-5" />} title="No vigilante action" desc="Never contact, threaten, trace, or investigate suspected scammers yourself. Use official channels." />
      </section>

    </>
  );
}

function ChallengeView({ onBack, profile, onEarnXP }: { onBack: () => void; profile: StudentProfile | null; onEarnXP: (xp: number) => void }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timed, setTimed] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCyberSquadChallenge()
      .then(data => setChallenges(data.challenges))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!timed || loading || finished || challenges.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setFinished(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timed, loading, finished, challenges.length]);

  const xpEarned = score + (timed ? timeLeft * 2 : 0);

  useEffect(() => {
    if (finished && profile && !awarded) {
      onEarnXP(xpEarned);
      setAwarded(true);
    }
  }, [awarded, finished, onEarnXP, profile, xpEarned]);

  const handleAnswer = useCallback((userSaysScam: boolean) => {
    const challenge = challenges[current];
    const correct = userSaysScam === challenge.is_scam;
    setAnswer(userSaysScam);
    setShowResult(true);
    if (correct) {
      const streakBonus = Math.min(streak, 4) * 10;
      setScore(prev => prev + 100 + streakBonus);
      setCorrectAnswers(prev => prev + 1);
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
    const pct = challenges.length ? Math.round((correctAnswers / challenges.length) * 100) : 0;
    return (
      <div className="mx-auto max-w-2xl">
        <div className="terminal-panel hot scroll-reveal p-8 text-center">
          <Trophy className="mx-auto h-16 w-16 text-[var(--amber)]" />
          <h1 className="glow-title mt-4 text-4xl">Practice complete</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Review the cues you missed, then try again when you are ready.</p>
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
            <button onClick={() => { setCurrent(0); setScore(0); setCorrectAnswers(0); setStreak(0); setTimeLeft(60); setFinished(false); setShowResult(false); setAnswer(null); setAwarded(false); }} className="button-primary min-h-11 px-5 text-sm">
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
            <h1 className="glow-title text-2xl">Spot the scam signal</h1>
            <p className="text-sm text-[var(--muted)]">Read the cues, make a call, then see the reasoning.</p>
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
          {timed ? <div className={`mono flex items-center gap-2 border bg-black/40 px-3 py-2 text-xs font-black ${timeLeft <= 10 ? 'border-[var(--red)] text-[var(--red)]' : 'border-[var(--line-dim)] text-[var(--green)]'}`}><Timer className="h-4 w-4" />{timeLeft}s</div> : <button onClick={() => { setTimed(true); setTimeLeft(60); }} className="button-ghost min-h-11 px-3 text-xs"><Timer className="h-4 w-4" />Try 60s sprint</button>}
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
          <span className="text-xs text-[var(--muted)]">What would you do?</span>
        </div>
        <div className="rounded border border-[var(--line-dim)] bg-black/60 px-5 py-4">
          <p className="mono text-sm leading-7 text-[var(--ink)] break-all">{challenge.content}</p>
        </div>

        {!showResult ? (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button onClick={() => handleAnswer(true)} className="flex min-h-14 flex-col items-center justify-center gap-1 border border-[var(--red)] bg-[rgba(255,77,77,0.08)] text-[var(--red)] transition hover:bg-[rgba(255,77,77,0.15)]">
              <span className="text-lg font-black">Scam signs</span>
              <span className="text-xs">Something is wrong</span>
            </button>
            <button onClick={() => handleAnswer(false)} className="flex min-h-14 flex-col items-center justify-center gap-1 border border-[var(--green)] bg-[rgba(101,255,105,0.08)] text-[var(--green)] transition hover:bg-[rgba(101,255,105,0.15)]">
              <span className="text-lg font-black">Likely genuine</span>
              <span className="text-xs">No obvious warning sign</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 animate-slide-up">
            <div className={`rounded border p-4 ${
              answer === challenge.is_scam
                ? 'border-[var(--green)] bg-[rgba(101,255,105,0.08)]'
                : 'border-[var(--red)] bg-[rgba(255,77,77,0.08)]'
            }`}>
              <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm font-bold">
                {answer === challenge.is_scam ? (
                  <span className="text-[var(--green)]">Nice read · +{100 + Math.min(Math.max(streak - 1, 0), 4) * 10} points</span>
                ) : (
                  <span className="text-[var(--red)]">Not quite — here is the cue to remember</span>
                )}
              </div>
              <p className="mono mt-2 text-xs leading-5 text-[var(--green-soft)]">{challenge.explanation}</p>
              <div className="mono mt-2 text-xs text-[var(--muted)]">
                Sample verdict: {challenge.is_scam ? 'Scam warning signs' : 'Likely genuine — still verify independently'}
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
            <h1 className="glow-title text-2xl">Monthly leaderboard</h1>
            <p className="text-sm text-[var(--muted)]">Illustrative pilot rankings · next reset in 12 days</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button aria-pressed={tab === 'universities'} onClick={() => setTab('universities')} className={`mono min-h-11 border px-3 text-xs font-black uppercase ${tab === 'universities' ? 'border-[var(--amber)] bg-[var(--amber)] text-black' : 'border-[var(--line-dim)] text-[var(--muted)] hover:border-[var(--green)]'}`}>
            <GraduationCap className="mr-1.5 inline h-3.5 w-3.5" /> Universities
          </button>
          <button aria-pressed={tab === 'hunters'} onClick={() => setTab('hunters')} className={`mono min-h-11 border px-3 text-xs font-black uppercase ${tab === 'hunters' ? 'border-[var(--amber)] bg-[var(--amber)] text-black' : 'border-[var(--line-dim)] text-[var(--muted)] hover:border-[var(--green)]'}`}>
            <Swords className="mr-1.5 inline h-3.5 w-3.5" /> Top hunters
          </button>
        </div>
      </section>

      <section className="leaderboard-prizes mt-5 scroll-reveal">
        <div><span className="eyebrow">This month</span><strong>RM1,000</strong><small>total prize pool</small></div>
        <div><span>🥇 1st</span><strong>RM500</strong></div>
        <div><span>🥈 2nd</span><strong>RM300</strong></div>
        <div><span>🥉 3rd</span><strong>RM200</strong></div>
        <p>Prizes are a proposed pilot and require sponsor confirmation, eligibility checks, and verified contributions. No reward is offered for confronting or pursuing suspected scammers.</p>
      </section>

      <div className="mt-5">
        {tab === 'universities' ? (
          <div className="grid gap-3">
            {data.universities.map((uni, i) => (
              <div key={uni.code} className={`leaderboard-row terminal-panel scroll-reveal flex items-center gap-4 p-4 ${i === 0 ? 'hot' : ''}`}>
                <div className={`mono grid h-11 w-11 shrink-0 place-items-center border text-lg font-black ${
                  i === 0 ? 'border-[var(--amber)] text-[var(--amber)]' :
                  i === 1 ? 'border-[var(--green-soft)] text-[var(--green-soft)]' :
                  i === 2 ? 'border-[var(--orange)] text-[var(--orange)]' :
                  'border-[var(--line-dim)] text-[var(--muted)]'
                }`}>
                  {i === 0 ? <><span className="sr-only">Rank 1</span><Crown aria-hidden="true" className="h-6 w-6" /></> : `#${uni.rank}`}
                </div>
                <div className="leaderboard-identity flex-1">
                  <div className="mono flex items-center gap-2 text-sm font-black text-[var(--ink)]">
                    {uni.code}
                    <span className="text-xs font-normal text-[var(--muted)]">— {uni.name}</span>
                  </div>
                  <div className="mono mt-1 text-xs text-[var(--muted)]">{uni.city}</div>
                </div>
                <div className="leaderboard-metrics grid grid-cols-3 gap-6 text-center">
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
              <div key={hunter.handle} className={`leaderboard-row terminal-panel scroll-reveal flex items-center gap-4 p-4 ${i === 0 ? 'hot' : ''}`}>
                <div className={`mono grid h-11 w-11 shrink-0 place-items-center border text-lg font-black ${
                  i === 0 ? 'border-[var(--amber)] text-[var(--amber)]' :
                  i === 1 ? 'border-[var(--green-soft)] text-[var(--green-soft)]' :
                  i === 2 ? 'border-[var(--orange)] text-[var(--orange)]' :
                  'border-[var(--line-dim)] text-[var(--muted)]'
                }`}>
                  {i === 0 ? <><span className="sr-only">Rank 1</span><Crown aria-hidden="true" className="h-6 w-6" /></> : `#${hunter.rank}`}
                </div>
                <div className="leaderboard-identity flex-1">
                  <div className="mono flex items-center gap-2 text-sm font-black text-[var(--ink)]">
                    {hunter.handle}
                    <span className="mono rounded-sm px-1.5 py-0.5 text-[0.6rem] font-black uppercase" style={{ color: badgeColor(hunter.badge), border: `1px solid ${badgeColor(hunter.badge)}`, background: 'rgba(0,0,0,0.4)' }}>
                      {hunter.badge}
                    </span>
                  </div>
                  <div className="mono mt-1 text-xs text-[var(--muted)]">{hunter.university}</div>
                </div>
                <div className="leaderboard-metrics grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="mono text-lg font-black text-[var(--amber)]">{hunter.xp.toLocaleString()}</div>
                    <div className="mono text-[0.6rem] uppercase text-[var(--muted)]">XP</div>
                  </div>
                  <div>
                    <div className="mono text-lg font-black text-[var(--green)]">{hunter.scams_caught}</div>
                    <div className="mono text-[0.6rem] uppercase text-[var(--muted)]">Verified signals</div>
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

function StudentProfileCard({ profile, onSave, onStart }: { profile: StudentProfile | null; onSave: (profile: StudentProfile) => void; onStart: () => void }) {
  const [handle, setHandle] = useState('');
  const [campus, setCampus] = useState('UM');

  if (profile) {
    const nextRank = RANKS.find(rank => rank.minXP > profile.xp);
    const currentRank = [...RANKS].reverse().find(rank => profile.xp >= rank.minXP) ?? RANKS[0];
    const progress = nextRank ? Math.min(100, Math.round((profile.xp / nextRank.minXP) * 100)) : 100;
    return (
      <section className="student-profile-card scroll-reveal">
        <div className="student-profile-avatar">{profile.handle.slice(0, 2).toUpperCase()}</div>
        <div className="student-profile-copy"><span>Your device profile</span><h3>{profile.handle} · {profile.campus}</h3><p>{currentRank.name} · {profile.xp.toLocaleString()} XP{nextRank ? ` · ${nextRank.minXP - profile.xp} XP to ${nextRank.name}` : ' · Top rank reached'}</p></div>
        <div className="profile-progress" aria-label={`${progress}% progress to next rank`}><span style={{ width: `${progress}%` }} /></div>
        <button onClick={onStart} className="button-primary min-h-11 px-4 text-sm">Continue practising <ChevronRight className="h-4 w-4" /></button>
      </section>
    );
  }

  return (
    <form className="join-card scroll-reveal" onSubmit={event => { event.preventDefault(); if (handle.trim()) onSave({ handle: handle.trim(), campus, xp: 0 }); }}>
      <div className="join-card-copy"><UserPlus className="h-6 w-6" /><div><span>Optional demo profile</span><h3>Keep your practice XP on this device</h3><p>No email, account, or public leaderboard entry. You can start playing without joining.</p></div></div>
      <label><span>Display name</span><input value={handle} onChange={event => setHandle(event.target.value)} className="field min-h-11 px-3" maxLength={24} placeholder="e.g. link_sleuth" /></label>
      <label><span>Campus</span><select value={campus} onChange={event => setCampus(event.target.value)} className="field min-h-11 px-3"><option>UM</option><option>UTM</option><option>USM</option><option>UKM</option><option>UPM</option><option>UiTM</option><option>IIUM</option><option>MMU</option><option>Other</option></select></label>
      <button type="submit" disabled={!handle.trim()} className="button-primary min-h-11 px-4 text-sm">Save profile</button>
    </form>
  );
}

function TrustRule({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <article className="trust-rule scroll-reveal">
      <div>{icon}</div><h3>{title}</h3><p>{desc}</p>
    </article>
  );
}
