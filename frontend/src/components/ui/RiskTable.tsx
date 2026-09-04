import { useNavigate } from 'react-router-dom';
import type { Assessment } from '../../types';
import RiskBadge from './RiskBadge';

interface RiskTableProps { assessments: Assessment[]; loading?: boolean; }

const STATUS_CLS: Record<string, string> = {
  Open: 'badge badge-open',
  'Under Review': 'badge badge-review',
  Approved: 'badge badge-approved',
  Escalated: 'badge badge-escalated',
  Resolved: 'badge badge-resolved',
};

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 8 }).map((_, j) => (
            <td key={j} className="px-3.5 py-3">
              <div className="skeleton h-3 rounded" style={{ width: j === 1 ? '80%' : j === 4 ? '50%' : '65%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function RiskTable({ assessments, loading }: RiskTableProps) {
  const navigate = useNavigate();

  const RISK_SCORE_COLOR: Record<string, string> = {
    LOW: '#22C55E', MEDIUM: '#F59E0B', HIGH: '#F97316', CRITICAL: '#EF4444',
  };

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {['Case ID', 'Customer', 'Amount', 'Score', 'Risk', 'Status', 'Date', 'Action'].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : assessments.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <p className="text-[#64748B] text-[13px]">No cases found</p>
                  <p className="text-[#374151] text-[11px] mt-1">Adjust your filters or create a new assessment</p>
                </td>
              </tr>
            ) : (
              assessments.map((a) => (
                <tr key={a.id} onClick={() => navigate(`/investigations/${a.id}`)}>
                  <td>
                    <span className="text-mono text-[11px] text-[#60A5FA]">{a.case_id}</span>
                  </td>
                  <td>
                    <p className="text-[13px] font-medium text-[#F8FAFC]">{a.customer_name}</p>
                    <p className="text-[11px] text-[#475569]">{a.customer_id}</p>
                  </td>
                  <td>
                    <span className="text-[13px] font-medium text-[#F8FAFC]">
                      ₹{a.transaction_amount.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[11px] text-[#475569]">{a.transaction_type}</p>
                  </td>
                  <td>
                    {a.risk_score != null ? (
                      <span
                        className="text-[14px] font-bold font-mono"
                        style={{ color: RISK_SCORE_COLOR[a.risk_level || 'LOW'] }}
                      >
                        {a.risk_score.toFixed(0)}
                      </span>
                    ) : (
                      <span className="text-[#374151] text-[11px]">—</span>
                    )}
                  </td>
                  <td><RiskBadge level={a.risk_level} /></td>
                  <td>
                    <span className={STATUS_CLS[a.status] || 'badge'}>{a.status}</span>
                  </td>
                  <td>
                    <span className="text-[12px] text-[#64748B]">
                      {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/investigations/${a.id}`); }}
                      className="btn btn-sm btn-secondary"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
