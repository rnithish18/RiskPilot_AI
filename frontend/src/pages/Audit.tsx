import { useEffect, useState, useRef } from 'react';
import { ScrollText, RefreshCw } from 'lucide-react';
import { getAuditLog } from '../services/api';
import type { AuditLog } from '../types';

const ACTION_STYLE: Record<string, { cls: string }> = {
  'Assessment Created': { cls: 'badge badge-open' },
  'Risk Analysis Executed': { cls: 'badge' + ' bg-[rgba(99,102,241,0.1)] text-[#818CF8]' },
  'Status Changed to Escalated': { cls: 'badge badge-escalated' },
  'Status Changed to Approved': { cls: 'badge badge-approved' },
  'Status Changed to Resolved': { cls: 'badge badge-resolved' },
  'Status Changed to Under Review': { cls: 'badge badge-review' },
  'Report Generated': { cls: 'badge bg-[rgba(99,102,241,0.1)] text-[#818CF8]' },
};

function getActionCls(action: string) {
  for (const key of Object.keys(ACTION_STYLE)) {
    if (action.startsWith(key) || action === key) return ACTION_STYLE[key].cls;
  }
  return 'badge bg-[rgba(100,116,139,0.1)] text-[#94A3B8]';
}

function fmtTime(ts: string) {
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
}

export default function Audit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    try { setLogs(await getAuditLog()); }
    catch { /* silent on refresh */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-[#F8FAFC] tracking-tight">Audit Log</h2>
          <p className="text-[12px] text-[#64748B] mt-0.5">
            {loading ? '—' : `${logs.length} entries`} · Auto-refreshes every 30 seconds
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); load(); }}
          className="btn btn-secondary btn-sm flex items-center gap-1.5"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="panel overflow-hidden">
          <table className="data-table">
            <thead><tr>{['Timestamp','Actor','Action','Case ID','Description'].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                  <td key={j}><div className="skeleton h-3 rounded" style={{ width: j === 0 ? '140px' : j === 4 ? '200px' : '80px' }} /></td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : logs.length === 0 ? (
        <div className="panel p-10 text-center">
          <ScrollText size={24} className="text-[#374151] mx-auto mb-3" />
          <p className="text-[13px] text-[#64748B]">No audit records yet</p>
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Case ID</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="!cursor-default">
                    <td>
                      <span className="font-mono text-[11px] text-[#64748B]">{fmtTime(log.timestamp)}</span>
                    </td>
                    <td>
                      <span className="text-[12px] bg-[rgba(255,255,255,0.04)] border border-[#1E2D42] px-2 py-0.5 rounded text-[#94A3B8]">
                        {log.user}
                      </span>
                    </td>
                    <td>
                      <span className={getActionCls(log.action)}>{log.action}</span>
                    </td>
                    <td>
                      {log.case_id
                        ? <span className="font-mono text-[11px] text-[#60A5FA]">{log.case_id}</span>
                        : <span className="text-[#374151]">—</span>}
                    </td>
                    <td className="text-[12px] text-[#64748B] max-w-xs">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-[#1E2D42] text-[11px] text-[#475569]">
            {logs.length} records · Risk Engine v1.0 · Auto-refresh every 30s
          </div>
        </div>
      )}
    </div>
  );
}
