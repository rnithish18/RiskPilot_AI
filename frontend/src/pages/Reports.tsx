import { useEffect, useState } from 'react';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { getInvestigations, generateReport } from '../services/api';
import type { Assessment } from '../types';
import RiskBadge from '../components/ui/RiskBadge';
import { useToast } from '../components/ui/Toast';

const STATUS_CLS: Record<string, string> = {
  Open: 'badge badge-open',
  'Under Review': 'badge badge-review',
  Approved: 'badge badge-approved',
  Escalated: 'badge badge-escalated',
  Resolved: 'badge badge-resolved',
};

export default function Reports() {
  const [investigations, setInvestigations] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getInvestigations()
      .then(setInvestigations)
      .catch(e => toast('error', 'Load error', e instanceof Error ? e.message : 'Unknown'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (assessment: Assessment) => {
    setDownloading(assessment.id);
    try {
      const blob = await generateReport(assessment.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `RiskPilot-${assessment.case_id}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast('success', 'Report downloaded', assessment.case_id);
    } catch (e: unknown) {
      toast('error', 'Report failed', e instanceof Error ? e.message : 'Error');
    } finally { setDownloading(null); }
  };

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-[#F8FAFC] tracking-tight">Reports</h2>
          <p className="text-[12px] text-[#64748B] mt-0.5">
            {loading ? '—' : `${investigations.length} investigation reports available`}
          </p>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center gap-2.5 bg-[rgba(59,130,246,0.06)] border border-[rgba(59,130,246,0.15)] rounded-md px-3.5 py-2.5">
        <FileText size={14} className="text-[#60A5FA] shrink-0" />
        <p className="text-[12px] text-[#94A3B8]">
          Reports include case details, risk score, all risk factors with explanations, AI analysis summary, recommended actions, and investigation status.
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="panel overflow-hidden">
          <table className="data-table">
            <thead><tr>{['Case ID','Customer','Amount','Risk Level','Status','Date','Download'].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                  <td key={j}><div className="skeleton h-3 rounded" style={{ width: j === 0 ? '80px' : '55px' }} /></td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : investigations.length === 0 ? (
        <div className="panel p-12 text-center">
          <FileText size={28} className="text-[#374151] mx-auto mb-3" />
          <p className="text-[13px] text-[#64748B]">No analyzed cases available</p>
          <p className="text-[11px] text-[#374151] mt-1">Run a risk assessment first to generate reports</p>
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {['Case ID', 'Customer', 'Amount', 'Risk Score', 'Risk Level', 'Status', 'Date', 'Report'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {investigations.map(inv => (
                  <tr key={inv.id}>
                    <td><span className="text-mono text-[11px] text-[#60A5FA]">{inv.case_id}</span></td>
                    <td>
                      <p className="text-[13px] font-medium text-[#F8FAFC]">{inv.customer_name}</p>
                      <p className="text-[11px] text-[#475569]">{inv.customer_id}</p>
                    </td>
                    <td className="text-[13px] font-medium text-[#F8FAFC]">
                      ₹{inv.transaction_amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      {inv.risk_score != null ? (
                        <span className="text-[13px] font-bold font-mono text-[#F8FAFC]">
                          {inv.risk_score.toFixed(0)}
                        </span>
                      ) : <span className="text-[#374151]">—</span>}
                    </td>
                    <td><RiskBadge level={inv.risk_level} /></td>
                    <td><span className={STATUS_CLS[inv.status] || 'badge'}>{inv.status}</span></td>
                    <td className="text-[12px] text-[#64748B]">
                      {new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDownload(inv)}
                        disabled={downloading === inv.id}
                        className="btn btn-secondary btn-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {downloading === inv.id
                          ? <div className="w-3 h-3 border border-[#64748B] border-t-transparent rounded-full animate-spin" />
                          : <Download size={12} />}
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-[#1E2D42] text-[11px] text-[#475569]">
            {investigations.length} reports available · Generated by RiskPilot Risk Engine v1.0
          </div>
        </div>
      )}
    </div>
  );
}
