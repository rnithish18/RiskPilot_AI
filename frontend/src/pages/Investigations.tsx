import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Filter, ChevronDown } from 'lucide-react';
import { getInvestigations } from '../services/api';
import type { Assessment } from '../types';
import RiskBadge from '../components/ui/RiskBadge';
import SearchBar from '../components/ui/SearchBar';

const STATUS_CLS: Record<string, string> = {
  Open: 'badge badge-open',
  'Under Review': 'badge badge-review',
  Approved: 'badge badge-approved',
  Escalated: 'badge badge-escalated',
  Resolved: 'badge badge-resolved',
};

const RISK_SCORE_COLOR: Record<string, string> = {
  LOW: '#22C55E', MEDIUM: '#F59E0B', HIGH: '#F97316', CRITICAL: '#EF4444',
};

const RISK_LEVELS = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES = ['All', 'Open', 'Under Review', 'Escalated', 'Approved', 'Resolved'];
const TX_TYPES = ['All', 'Payment', 'Transfer', 'Withdrawal', 'Purchase', 'Refund', 'Login', 'Account Change', 'Other'];

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 9 }).map((_, j) => (
            <td key={j} className="px-3.5 py-3">
              <div className="skeleton h-3 rounded" style={{ width: j === 1 ? '90px' : j === 2 ? '70px' : '55px' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

type SortKey = 'risk_score' | 'transaction_amount' | 'created_at';
type SortDir = 'asc' | 'desc';

export default function Investigations() {
  const [investigations, setInvestigations] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [txFilter, setTxFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('risk_score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;
  const navigate = useNavigate();

  useEffect(() => {
    getInvestigations()
      .then(setInvestigations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortArrow = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span className="text-[#374151] ml-1">↕</span>;
    return <span className="text-[#60A5FA] ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const filtered = investigations
    .filter(a =>
      (riskFilter === 'All' || a.risk_level === riskFilter) &&
      (statusFilter === 'All' || a.status === statusFilter) &&
      (txFilter === 'All' || a.transaction_type === txFilter) &&
      (!search || [a.case_id, a.customer_name, a.customer_id, a.current_location, a.location]
        .some(v => v?.toLowerCase().includes(search.toLowerCase())))
    )
    .sort((a, b) => {
      const v = sortKey === 'risk_score' ? [(a.risk_score ?? 0), (b.risk_score ?? 0)]
        : sortKey === 'transaction_amount' ? [a.transaction_amount, b.transaction_amount]
        : [new Date(a.created_at).getTime(), new Date(b.created_at).getTime()];
      return sortDir === 'asc' ? v[0] - v[1] : v[1] - v[0];
    });

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetFilters = () => { setSearch(''); setRiskFilter('All'); setStatusFilter('All'); setTxFilter('All'); setPage(1); };

  const criticalCount = investigations.filter(i => i.risk_level === 'CRITICAL').length;
  const openCount = investigations.filter(i => i.status === 'Open').length;

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-[#F8FAFC] tracking-tight">Investigations</h2>
          <p className="text-[12px] text-[#64748B] mt-0.5">
            {loading ? '—' : `${openCount} open · ${criticalCount} critical · ${investigations.length} total cases`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm flex items-center gap-1.5">
            <Download size={13} /> Export
          </button>
          <button onClick={() => navigate('/assess')} className="btn btn-primary btn-sm flex items-center gap-1.5">
            <Plus size={13} /> New Assessment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="panel p-3 flex flex-wrap gap-3 items-center">
        <div className="w-52">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search case, customer, location..." />
        </div>

        {[
          { label: 'Risk', value: riskFilter, options: RISK_LEVELS, set: (v: string) => { setRiskFilter(v); setPage(1); } },
          { label: 'Status', value: statusFilter, options: STATUSES, set: (v: string) => { setStatusFilter(v); setPage(1); } },
          { label: 'Type', value: txFilter, options: TX_TYPES, set: (v: string) => { setTxFilter(v); setPage(1); } },
        ].map(f => (
          <select
            key={f.label}
            value={f.value}
            onChange={e => f.set(e.target.value)}
            className="field-input py-[7px] text-[12px] w-auto cursor-pointer"
          >
            {f.options.map(o => (
              <option key={o} value={o}>{o === 'All' ? `All ${f.label}s` : o}</option>
            ))}
          </select>
        ))}

        {(search || riskFilter !== 'All' || statusFilter !== 'All' || txFilter !== 'All') && (
          <button onClick={resetFilters} className="text-[12px] text-[#64748B] hover:text-[#94A3B8]">
            Clear filters
          </button>
        )}

        <span className="ml-auto text-[12px] text-[#475569]">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Customer</th>
                <th
                  className="cursor-pointer hover:text-[#94A3B8]"
                  onClick={() => handleSort('transaction_amount')}
                >
                  Amount <SortArrow k="transaction_amount" />
                </th>
                <th
                  className="cursor-pointer hover:text-[#94A3B8]"
                  onClick={() => handleSort('risk_score')}
                >
                  Score <SortArrow k="risk_score" />
                </th>
                <th>Risk</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th
                  className="cursor-pointer hover:text-[#94A3B8]"
                  onClick={() => handleSort('created_at')}
                >
                  Date <SortArrow k="created_at" />
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <p className="text-[#64748B] text-[13px]">No investigations match your filters</p>
                    <button onClick={resetFilters} className="text-[12px] text-[#3B82F6] mt-1 hover:underline">
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                pageData.map(a => (
                  <tr key={a.id} onClick={() => navigate(`/investigations/${a.id}`)}>
                    <td><span className="text-mono text-[11px] text-[#60A5FA]">{a.case_id}</span></td>
                    <td>
                      <p className="text-[13px] font-medium text-[#F8FAFC]">{a.customer_name}</p>
                      <p className="text-[11px] text-[#475569]">{a.customer_id}</p>
                    </td>
                    <td>
                      <p className="text-[13px] font-medium text-[#F8FAFC]">₹{a.transaction_amount.toLocaleString('en-IN')}</p>
                    </td>
                    <td>
                      {a.risk_score != null ? (
                        <span className="text-[14px] font-bold font-mono" style={{ color: RISK_SCORE_COLOR[a.risk_level || 'LOW'] }}>
                          {a.risk_score.toFixed(0)}
                        </span>
                      ) : <span className="text-[#374151] text-[11px]">—</span>}
                    </td>
                    <td><RiskBadge level={a.risk_level} /></td>
                    <td className="text-[12px] text-[#94A3B8]">{a.current_location || a.location || '—'}</td>
                    <td className="text-[12px] text-[#64748B]">{a.transaction_type}</td>
                    <td><span className={STATUS_CLS[a.status] || 'badge'}>{a.status}</span></td>
                    <td className="text-[12px] text-[#64748B]">
                      {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-4 py-2.5 border-t border-[#1E2D42] flex items-center justify-between">
            <span className="text-[11px] text-[#475569]">
              Page {page} of {pages} · {filtered.length} results
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-sm btn-secondary px-2.5 disabled:opacity-40"
              >←</button>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`btn btn-sm px-2.5 ${page === p ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="btn btn-sm btn-secondary px-2.5 disabled:opacity-40"
              >→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
