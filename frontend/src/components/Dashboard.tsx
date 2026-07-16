import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, AlertTriangle, DollarSign, Radio, Shield, Target, TrendingUp } from 'lucide-react';
import { api } from '../api';
import type { Stats } from '../api';

const COLORS = ['#65ff69', '#ffd35a', '#75e9ff', '#ff54dc', '#ff4d4d', '#8aa58e'];

const tooltipStyle = {
  background: '#050605',
  border: '1px solid rgba(101, 255, 105, 0.35)',
  borderRadius: 3,
  boxShadow: '0 0 24px rgba(101,255,105,0.12)',
  color: '#ecffef',
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then(setStats)
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

  if (!stats) return <p className="mono text-center text-[var(--muted)]">Failed to load dashboard</p>;

  const ms = stats.malaysia_stats;

  return (
    <div className="mx-auto max-w-[1500px]">
      <section className="scroll-reveal flex flex-col gap-4 border-b border-[var(--line-dim)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="panel-kicker">Data literacy exercise</p>
          <h1 className="glow-title mt-2 text-4xl sm:text-5xl">Practice data</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Illustrative data for discussing risk trends. It is not a live national telemetry feed or an official incident statistic.
          </p>
        </div>
        <div className="mono flex w-fit items-center gap-2 border border-[var(--line)] bg-black/40 px-3 py-2 text-xs font-black uppercase text-[var(--green)]">
          <span className="status-dot" />
          sample view
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Total incidents"
          value={ms.total_incidents_2025.toLocaleString()}
          tone="text-[var(--red)]"
        />
        <MetricCard
          icon={<Target className="h-5 w-5" />}
          label="Fraud share"
          value={`${ms.fraud_percentage}%`}
          tone="text-[var(--amber)]"
        />
        <MetricCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Losses reported"
          value={`RM ${ms.total_losses_rm_billion}B`}
          tone="text-[var(--cyan)]"
        />
        <MetricCard
          icon={<Shield className="h-5 w-5" />}
          label="Scans performed"
          value={stats.total_analyses.toString()}
          tone="text-[var(--green)]"
        />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[430px_1fr_360px]">
        <ChartPanel title="Protocol mix" icon={<Radio className="h-4 w-4" />} badge="ALL">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={ms.top_attack_types}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={100}
                dataKey="percentage"
                nameKey="type"
                paddingAngle={2}
              >
                {ms.top_attack_types.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid gap-2">
            {ms.top_attack_types.map((item, i) => (
              <div key={item.type}>
                <div className="mono mb-1 flex justify-between text-xs font-black text-[var(--green-soft)]">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2" style={{ background: COLORS[i % COLORS.length] }} />
                    {item.type}
                  </span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="rank-bar">
                  <span style={{ width: `${item.percentage}%`, background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </ChartPanel>

        <ChartPanel title="Monthly incident trend" icon={<TrendingUp className="h-4 w-4" />} badge="SAMPLE">
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={ms.monthly_trend} margin={{ left: -8, right: 8, top: 12, bottom: 0 }}>
              <defs>
                <linearGradient id="dashboardIncidents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#65ff69" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#65ff69" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(101,255,105,0.12)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="incidents" stroke="#65ff69" fill="url(#dashboardIncidents)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Sector wall" icon={<Target className="h-4 w-4" />} badge="MY">
          <div className="grid gap-4">
            {ms.top_targeted_sectors.map(sector => (
              <div key={sector.sector}>
                <div className="mono mb-1 flex justify-between text-xs font-black text-[var(--green-soft)]">
                  <span>{sector.sector}</span>
                  <span>{sector.percentage}%</span>
                </div>
                <div className="rank-bar">
                  <span style={{ width: `${sector.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartPanel>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_430px]">
        <ChartPanel title="Incidents by type" icon={<Activity className="h-4 w-4" />} badge="COUNT">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ms.top_attack_types} margin={{ left: -8, right: 8, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(101,255,105,0.12)" vertical={false} />
              <XAxis dataKey="type" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {ms.top_attack_types.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <div className="terminal-panel scroll-reveal p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="panel-kicker">Console notes</h3>
            <span className="protocol-chip active px-2 py-0.5">SRC</span>
          </div>
          <div className="mono grid gap-3 text-xs leading-5 text-[var(--green-soft)]">
            <p>Use official CyberSecurity Malaysia reports for current incident data.</p>
            <p>Use PDRM and NSRC channels for scam response.</p>
            <p className="border-t border-[var(--line-dim)] pt-3 text-[var(--muted)]">
              Local scan counts reflect this running app session. Illustrations must not be cited as national statistics.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="terminal-panel scroll-reveal p-4">
      <div className={`mb-5 grid h-10 w-10 place-items-center border border-current bg-black/40 ${tone}`}>
        {icon}
      </div>
      <div className="mono text-4xl font-black text-[var(--amber)]">{value}</div>
      <div className="mono mt-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">{label}</div>
    </div>
  );
}

function ChartPanel({
  icon,
  title,
  badge,
  children,
}: {
  icon: ReactNode;
  title: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <div className="terminal-panel scroll-reveal">
      <div className="panel-title px-4 py-3">
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        <span className="protocol-chip active px-2 py-0.5">{badge}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
