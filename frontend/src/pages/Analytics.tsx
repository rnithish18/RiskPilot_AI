import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend, ResponsiveContainer
} from 'recharts';
import { getAnalytics } from '../services/api';
import type { AnalyticsData } from '../types';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
];

const TOOLTIP = {
  contentStyle: { background: '#151E30', border: '1px solid #243047', borderRadius: 6, fontSize: 12 },
  labelStyle: { color: '#94A3B8', marginBottom: 4 },
  itemStyle: { fontSize: 12 },
};

const CHART_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#22C55E'];

export default function Analytics() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (r: string) => {
    setLoading(true); setError('');
    try { setData(await getAnalytics(r)); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(range); }, [range]);

  const total = data ? data.risk_distribution.reduce((s, d) => s + d.value, 0) || 1 : 1;

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-[#F8FAFC] tracking-tight">Analytics</h2>
          <p className="text-[12px] text-[#64748B] mt-0.5">Risk trends, distribution, and behavioral insights</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Range selector */}
          <div className="flex border border-[#243047] rounded overflow-hidden">
            {RANGES.map(r => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  range === r.key
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.03)]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={() => load(range)} className="btn btn-secondary btn-sm flex items-center gap-1.5">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="panel p-6 text-center">
          <AlertTriangle size={20} className="text-[#EF4444] mx-auto mb-2" />
          <p className="text-[13px] text-[#64748B]">{error}</p>
          <button onClick={() => load(range)} className="btn btn-secondary btn-sm mt-3">Retry</button>
        </div>
      )}

      {!error && (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="panel p-3.5">
                  <div className="skeleton h-2.5 w-24 mb-2 rounded" />
                  <div className="skeleton h-6 w-14 rounded" />
                </div>
              ))
              : data ? [
                { label: 'Avg Risk Score', value: data.avg_risk_score.toFixed(1), color: data.avg_risk_score > 60 ? '#EF4444' : data.avg_risk_score > 30 ? '#F59E0B' : '#22C55E' },
                { label: 'Total Cases', value: total.toLocaleString(), color: '#3B82F6' },
                { label: 'Critical Cases', value: (data.risk_distribution.find(d => d.name === 'CRITICAL')?.value || 0).toString(), color: '#EF4444' },
                { label: 'High-Risk Rate', value: `${(((data.risk_distribution.find(d => d.name === 'CRITICAL')?.value || 0) + (data.risk_distribution.find(d => d.name === 'HIGH')?.value || 0)) / total * 100).toFixed(1)}%`, color: '#F97316' },
              ].map(kpi => (
                <div key={kpi.label} className="panel p-3.5">
                  <p className="text-[10px] text-[#64748B] uppercase tracking-[0.05em] mb-1.5">{kpi.label}</p>
                  <p className="text-[22px] font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                </div>
              )) : null}
          </div>

          {/* Trend + Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="panel p-4 lg:col-span-2">
              <h3 className="text-[13px] font-semibold text-[#F8FAFC] mb-0.5">Risk Score Trend</h3>
              <p className="text-[11px] text-[#64748B] mb-4">Average risk score over time</p>
              {loading ? <div className="skeleton h-[200px] rounded" /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data?.risk_trend || []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1E2D42" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip {...TOOLTIP} />
                    <Area type="monotone" dataKey="avg_score" stroke="#3B82F6" fill="url(#ag)" strokeWidth={2} name="Avg Score" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Distribution */}
            <div className="panel p-4">
              <h3 className="text-[13px] font-semibold text-[#F8FAFC] mb-0.5">Distribution</h3>
              <p className="text-[11px] text-[#64748B] mb-4">Cases by risk level</p>
              {loading ? <div className="skeleton h-[180px] rounded" /> : data ? (
                <>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={data.risk_distribution} cx="50%" cy="50%" innerRadius={35} outerRadius={56}
                        dataKey="value" paddingAngle={2}>
                        {data.risk_distribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...TOOLTIP} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {data.risk_distribution.map(d => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-sm" style={{ background: d.color }} />
                          <span className="text-[12px] text-[#94A3B8]">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-[#F8FAFC]">{d.value}</span>
                          <span className="text-[11px] text-[#475569] w-8 text-right">{((d.value / total) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* By Location + By Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="panel p-4">
              <h3 className="text-[13px] font-semibold text-[#F8FAFC] mb-0.5">Risk by Location</h3>
              <p className="text-[11px] text-[#64748B] mb-4">Case count per city</p>
              {loading ? <div className="skeleton h-[200px] rounded" /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart layout="vertical" data={data?.risk_by_location?.slice(0, 8) || []}
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1E2D42" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="location" tick={{ fill: '#94A3B8', fontSize: 11 }}
                      tickLine={false} width={72} />
                    <Tooltip {...TOOLTIP} />
                    <Bar dataKey="count" fill="#6366F1" radius={[0, 3, 3, 0]} maxBarSize={18} name="Cases" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="panel p-4">
              <h3 className="text-[13px] font-semibold text-[#F8FAFC] mb-0.5">Risk by Transaction Type</h3>
              <p className="text-[11px] text-[#64748B] mb-4">Average risk score by category</p>
              {loading ? <div className="skeleton h-[200px] rounded" /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data?.risk_by_type || []} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1E2D42" vertical={false} />
                    <XAxis dataKey="type" tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip {...TOOLTIP} />
                    <Bar dataKey="avg_score" fill="#F59E0B" radius={[3, 3, 0, 0]} maxBarSize={32} name="Avg Score" opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Critical over time */}
          <div className="panel p-4">
            <h3 className="text-[13px] font-semibold text-[#F8FAFC] mb-0.5">Critical Cases Over Time</h3>
            <p className="text-[11px] text-[#64748B] mb-4">Daily count of CRITICAL risk assessments</p>
            {loading ? <div className="skeleton h-[160px] rounded" /> : (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={data?.critical_over_time || []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#1E2D42" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip {...TOOLTIP} />
                  <Line type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={2}
                    dot={{ fill: '#EF4444', r: 3 }} name="Critical" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
