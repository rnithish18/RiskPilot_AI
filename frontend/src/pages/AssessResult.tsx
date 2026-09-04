import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react';
import { getAssessment, generateReport, updateStatus } from '../services/api';
import type { Assessment } from '../types';
import { STATUS_CLASSES } from '../types';
import RiskGauge from '../components/ui/RiskGauge';
import RiskBadge from '../components/ui/RiskBadge';
import RiskFactorCard from '../components/ui/RiskFactorCard';
import AIExplanationCard from '../components/ui/AIExplanationCard';
import RecommendationCard from '../components/ui/RecommendationCard';
import AnomalyPanel from '../components/ui/AnomalyPanel';
import { useToast } from '../components/ui/Toast';

const STATUS_CLS: Record<string, string> = {
  Open: 'badge badge-open',
  'Under Review': 'badge badge-review',
  Approved: 'badge badge-approved',
  Escalated: 'badge badge-escalated',
  Resolved: 'badge badge-resolved',
};

const STATUSES = ['Open', 'Under Review', 'Approved', 'Escalated', 'Resolved'];

export default function AssessResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    if (!id) return;
    getAssessment(Number(id))
      .then(a => { setAssessment(a); setSelectedStatus(a.status); })
      .catch(e => toast('error', 'Load error', e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReport = async () => {
    if (!id) return;
    setReportLoading(true);
    try {
      const blob = await generateReport(Number(id));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `RiskPilot-${assessment?.case_id}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast('success', 'Report downloaded');
    } catch (e: unknown) {
      toast('error', 'Report failed', e instanceof Error ? e.message : 'Error');
    } finally { setReportLoading(false); }
  };

  const handleStatus = async (status: string) => {
    if (!id || !assessment) return;
    try {
      await updateStatus(Number(id), status);
      setAssessment(prev => prev ? { ...prev, status: status as Assessment['status'] } : prev);
      setSelectedStatus(status);
      toast('success', `Status updated to "${status}"`);
    } catch (e: unknown) {
      toast('error', 'Update failed', e instanceof Error ? e.message : 'Error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!assessment) return (
    <div className="panel p-8 text-center max-w-md mx-auto">
      <AlertTriangle size={24} className="text-[#EF4444] mx-auto mb-3" />
      <p className="text-[14px] text-[#F8FAFC]">Assessment not found</p>
    </div>
  );

  const explanation = assessment.explanation;
  const level = assessment.risk_level;
  const score = assessment.risk_score;

  const LEVEL_BG: Record<string, string> = {
    LOW: '#0F2318', MEDIUM: '#1C1A0E', HIGH: '#1C1108', CRITICAL: '#200D0D',
  };
  const LEVEL_BORDER: Record<string, string> = {
    LOW: '#22C55E30', MEDIUM: '#F59E0B30', HIGH: '#F9731630', CRITICAL: '#EF444430',
  };

  return (
    <div className="max-w-[1300px] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/assess')} className="text-[#64748B] hover:text-[#94A3B8] p-1 rounded">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-semibold text-[#F8FAFC]">Assessment Result</h2>
              <RiskBadge level={level} />
            </div>
            <p className="text-[11px] font-mono text-[#475569] mt-0.5">{assessment.case_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={e => handleStatus(e.target.value)}
            className="field-input text-[12px] py-1.5 w-auto cursor-pointer"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={handleReport}
            disabled={reportLoading}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
          >
            {reportLoading
              ? <div className="w-3 h-3 border border-[#64748B] border-t-transparent rounded-full animate-spin" />
              : <FileText size={13} />}
            PDF Report
          </button>
          <button
            onClick={() => navigate(`/investigations/${assessment.id}`)}
            className="btn btn-primary btn-sm"
          >
            Open Investigation →
          </button>
        </div>
      </div>

      {/* Score banner */}
      {score != null && level && (
        <div
          className="panel px-5 py-4 flex items-center gap-6"
          style={{ background: LEVEL_BG[level] || '#0F172A', borderColor: LEVEL_BORDER[level] || '#1E2D42' }}
        >
          <div className="shrink-0">
            <RiskGauge score={score} size={160} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[32px] font-bold text-[#F8FAFC] leading-none">{score.toFixed(0)}</span>
              <span className="text-[16px] text-[#64748B]">/100</span>
              <RiskBadge level={level} size="md" />
            </div>
            <p className="text-[13px] text-[#94A3B8] mb-3">
              Customer: <span className="text-[#F8FAFC] font-medium">{assessment.customer_name}</span>
              {' · '}
              Amount: <span className="text-[#F8FAFC] font-medium">₹{assessment.transaction_amount.toLocaleString('en-IN')}</span>
              {' · '}
              {assessment.transaction_type} · {assessment.current_location}
            </p>
            <div className="flex flex-wrap gap-3 text-[12px]">
              {[
                { label: 'Confidence', value: score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low' },
                { label: 'Device', value: assessment.is_new_device ? 'New (unrecognized)' : assessment.device_type },
                { label: 'Time', value: assessment.login_time },
                { label: 'Frequency', value: `${assessment.transaction_frequency} txn/day` },
              ].map(m => (
                <div key={m.label}>
                  <span className="text-[#475569]">{m.label}: </span>
                  <span className="text-[#94A3B8]">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Left: Factors + Explanation */}
        <div className="xl:col-span-3 space-y-4">
          {/* Risk Factors */}
          <div className="panel p-4">
            <h3 className="text-[13px] font-semibold text-[#F8FAFC] mb-1">Risk Factors</h3>
            <p className="text-[11px] text-[#64748B] mb-3">
              {assessment.risk_factors.length} factors contributed to this score
            </p>
            <RiskFactorCard factors={assessment.risk_factors} />
          </div>

          {/* AI Explanation */}
          {explanation && (
            <div className="panel p-4">
              <AIExplanationCard explanation={explanation} />
            </div>
          )}

          {/* Anomaly */}
          {explanation?.anomaly && (
            <div className="panel p-4">
              <AnomalyPanel anomaly={explanation.anomaly} />
            </div>
          )}
        </div>

        {/* Right: Recommendation */}
        <div className="xl:col-span-2">
          {explanation && (
            <div className="panel p-4">
              <RecommendationCard
                recommendation={explanation.recommendation}
                riskLevel={level!}
                onAction={handleStatus}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
