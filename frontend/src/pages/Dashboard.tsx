import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, ArrowUpRight, Clock, TrendingUp, AlertTriangle, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { getDashboard } from '../services/api';
import type { DashboardStats } from '../types';
import RiskBadge from '../components/ui/RiskBadge';

const RISK_SCORE_COLOR: Record<string, string> = {
  LOW: '#22C55E', MEDIUM: '#F59E0B', HIGH: '#F97316', CRITICAL: '#EF4444',
};

const STATUS_CLS: Record<string, string> = {
  Open: 'badge badge-open',
  'Under Review': 'badge badge-review',
  Approved: 'badge badge-approved',
  Escalated: 'badge badge-escalated',
  Resolved: 'badge badge-resolved',
};

const TOOLTIP_STYLE = {
  contentStyle: { background: '#151E30', border: '1px solid #243047', borderRadius: 6, fontSize: 12, color: '#94A3B8' },
  labelStyle: { color: '#94A3B8', marginBottom: 4 },
  itemStyle: { fontSize: 12 },
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await getDashboard();
      setStats(data);
      setLastUpdated(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (error) return (
    <div className="panel p-8 text-center max-w-md mx-auto mt-8">
      <AlertTriangle size={24} className="text-[#EF4444] mx-auto mb-3" />
      <p className="text-[14px] font-medium text-[#F8FAFC] mb-1">Unable to load dashboard</p>
      <p className="text-[12px] text-[#64748B] mb-4">{error}</p>
      <button onClick={load} className="btn btn-primary btn-sm">Retry</button>
    </div>
  );

  const total = stats ? (stats.low_count + stats.medium_count + stats.high_count + stats.critical_count) || 1 : 1;

  const kpis = stats ? [
    { label: 'Total Assessments', value: stats.total_assessments, sub: 'All time', icon: <Activity size={14} />, color: '#3B82F6' },
    { label: 'Critical', value: stats.critical_count, sub: `${((stats.critical_count / total) * 100).toFixed(1)}% of total`, icon: <AlertTriangle size={14} />, color: '#EF4444' },
    { label: 'High Risk', value: stats.high_count, sub: `${((stats.high_count / total) * 100).toFixed(1)}% of total`, icon: <TrendingUp size={14} />, color: '#F97316' },
    { label: 'Medium Risk', value: stats.medium_count, sub: `${((stats.medium_count / total) * 100).toFixed(1)}% of total`, icon: <Activity size={14} />, color: '#F59E0B' },
    { label: 'Low Risk', value: stats.low_count, sub: `${((stats.low_count / total) * 100).toFixed(1)}% of total`, icon: <Activity size={14} />, color: '#22C55E' },
    { label: 'Open Investigations', value: stats.recent_events?.filter(e => e.status === 'Open').length ?? 0, sub: 'Require attention', icon: <Clock size={14} />, color: '#6366F1' },
  ] : [];

  const distData = stats ? [
    { label: 'Critical', value: stats.critical_count, color: '#EF4444' },
    { label: 'High', value: stats.high_count, color: '#F97316' },
    { label: 'Medium', value: stats.medium_count, color: '#F59E0B' },
    { label: 'Low', value: stats.low_count, color: '#22C55E' },
  ] : [];

  return (
    <div className="space-y-5 max-w-[1400px]">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold text-[#F8FAFC] tracking-tight">Dashboard</h2>
          <p className="text-[12px] text-[#64748B] mt-0.5">
            Last updated: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ·{' '}
            <span className="text-[#22C55E]">● System operational</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={() => navigate('/assess')} className="btn btn-primary btn-sm">
            New Assessment
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="panel p-3.5">
              <div className="skeleton h-2.5 w-20 mb-2 rounded" />
              <div className="skeleton h-6 w-12 rounded" />
              <div className="skeleton h-2 w-16 mt-2 rounded" />
            </div>
          ))
          : kpis.map((kpi) => (
            <div key={kpi.label} className="panel p-3.5 hover:border-[#243047]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span style={{ color: kpi.color }}>{kpi.icon}</span>
                <span className="text-[10px] text-[#64748B] font-medium uppercase tracking-[0.05em]">{kpi.label}</span>
              </div>
              <p className="text-[22px] font-bold text-[#F8FAFC] leading-none" style={{ color: kpi.color === '#3B82F6' ? '#F8FAFC' : kpi.color }}>
                {kpi.value.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#475569] mt-1">{kpi.sub}</p>
            </div>
          ))
        }
      </div>

      {/* Risk Trend + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend chart */}
        <div className="panel p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[13px] font-semibold text-[#F8FAFC]">Risk Trend</h3>
              <p className="text-[11px] text-[#64748B] mt-0.5">Cases by severity over 30 days</p>
            </div>
          </div>
          {loading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="skeleton h-full w-full rounded" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats?.risk_trend || []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  {[['critical','#EF4444'],['high','#F97316'],['medium','#F59E0B'],['low','#22C55E']].map(([id, color]) => (
                    <linearGradient key={id} id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#1E2D42" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="#EF4444" fill="url(#g-critical)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="high" stackId="1" stroke="#F97316" fill="url(#g-high)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="medium" stackId="1" stroke="#F59E0B" fill="url(#g-medium)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="low" stackId="1" stroke="#22C55E" fill="url(#g-low)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Distribution */}
        <div className="panel p-4">
          <h3 className="text-[13px] font-semibold text-[#F8FAFC] mb-1">Risk Distribution</h3>
          <p className="text-[11px] text-[#64748B] mb-4">Share by severity level</p>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}><div className="skeleton h-3 rounded" style={{ width: `${60 + i * 10}%` }} /></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {distData.map((d) => (
                <div key={d.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-[#94A3B8]">{d.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-[#F8FAFC]">{d.value}</span>
                      <span className="text-[11px] text-[#475569] w-10 text-right">
                        {((d.value / total) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-[3px] bg-[#1E2D42] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(d.value / total) * 100}%`,
                        background: d.color,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Risk by category */}
          {!loading && stats && (
            <>
              <div className="divider" />
              <h4 className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.05em] mb-3">By Category</h4>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={stats.risk_by_category} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#1E2D42" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="value" fill="#3B82F6" opacity={0.8} radius={[3, 3, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      {/* Priority Investigations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[14px] font-semibold text-[#F8FAFC]">Priority Investigations</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              {stats ? `${stats.recent_events.filter(e => ['CRITICAL','HIGH'].includes(e.risk_level || '')).length} high-severity cases requiring attention` : '—'}
            </p>
          </div>
          <button onClick={() => navigate('/investigations')} className="btn btn-secondary btn-sm flex items-center gap-1">
            All cases <ArrowUpRight size={12} />
          </button>
        </div>

        <div className="panel overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Score</th>
                <th>Risk</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j}><div className="skeleton h-3 rounded" style={{ width: j === 0 ? '80px' : '60px' }} /></td>
                    ))}
                  </tr>
                ))
              ) : !stats || stats.recent_events.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-[#64748B] text-[13px]">No recent events</td>
                </tr>
              ) : (
                [...stats.recent_events]
                  .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
                  .map((a) => (
                    <tr key={a.id} onClick={() => navigate(`/investigations/${a.id}`)}>
                      <td><span className="text-mono text-[11px] text-[#60A5FA]">{a.case_id}</span></td>
                      <td>
                        <p className="text-[13px] font-medium text-[#F8FAFC]">{a.customer_name}</p>
                        <p className="text-[11px] text-[#475569]">{a.customer_id}</p>
                      </td>
                      <td className="text-[13px] font-medium text-[#F8FAFC]">
                        ₹{a.transaction_amount.toLocaleString('en-IN')}
                      </td>
                      <td>
                        {a.risk_score != null ? (
                          <span className="text-[14px] font-bold font-mono" style={{ color: RISK_SCORE_COLOR[a.risk_level || 'LOW'] }}>
                            {a.risk_score.toFixed(0)}
                          </span>
                        ) : <span className="text-[#374151]">—</span>}
                      </td>
                      <td><RiskBadge level={a.risk_level} /></td>
                      <td className="text-[12px] text-[#94A3B8]">{a.current_location || a.location || '—'}</td>
                      <td className="text-[12px] text-[#64748B]">{a.transaction_type}</td>
                      <td><span className={STATUS_CLS[a.status] || 'badge'}>{a.status}</span></td>
                      <td>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/investigations/${a.id}`); }}
                          className="btn btn-xs btn-secondary"
                        >
                          Investigate →
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
