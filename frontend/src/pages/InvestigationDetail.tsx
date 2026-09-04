import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react';
import { getInvestigation, updateStatus, generateReport } from '../services/api';
import type { Assessment, TimelineEvent } from '../types';
import RiskGauge from '../components/ui/RiskGauge';
import RiskBadge from '../components/ui/RiskBadge';
import RiskFactorCard from '../components/ui/RiskFactorCard';
import AIExplanationCard from '../components/ui/AIExplanationCard';
import RecommendationCard from '../components/ui/RecommendationCard';
import RiskTimeline from '../components/ui/RiskTimeline';
import AnomalyPanel from '../components/ui/AnomalyPanel';
import { useToast } from '../components/ui/Toast';

const STATUSES = ['Open', 'Under Review', 'Approved', 'Escalated', 'Resolved'];

const STATUS_CLS: Record<string, string> = {
  Open: 'badge badge-open',
  'Under Review': 'badge badge-review',
  Approved: 'badge badge-approved',
  Escalated: 'badge badge-escalated',
  Resolved: 'badge badge-resolved',
};

function InfoBlock({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="py-2 border-b border-[#1E2D42] last:border-0">
      <p className="text-[10px] text-[#475569] uppercase tracking-[0.06em] mb-0.5">{label}</p>
      <p className={`text-[13px] font-medium text-[#F8FAFC] ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

export default function InvestigationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [investigation, setInvestigation] = useState<Assessment & { timeline?: TimelineEvent[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    if (!id) return;
    getInvestigation(Number(id))
      .then(data => {
        setInvestigation(data as Assessment & { timeline?: TimelineEvent[] });
        setSelectedStatus(data.status);
      })
      .catch(e => toast('error', 'Load error', e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatus = async (newStatus: string) => {
    if (!id || newStatus === investigation?.status) return;
    try {
      await updateStatus(Number(id), newStatus);
      setInvestigation(prev => prev ? { ...prev, status: newStatus as Assessment['status'] } : prev);
      setSelectedStatus(newStatus);
      toast('success', 'Status updated', `Case marked as "${newStatus}"`);
    } catch (e: unknown) {
      toast('error', 'Update failed', e instanceof Error ? e.message : 'Error');
    }
  };

  const handleReport = async () => {
    if (!id) return;
    setReportLoading(true);
    try {
      const blob = await generateReport(Number(id));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `RiskPilot-${investigation?.case_id}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast('success', 'Report downloaded');
    } catch (e: unknown) {
      toast('error', 'Report failed', e instanceof Error ? e.message : 'Error');
    } finally { setReportLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!investigation) return (
    <div className="panel p-8 text-center max-w-md mx-auto">
      <AlertTriangle size={24} className="text-[#EF4444] mx-auto mb-3" />
      <p className="text-[14px] text-[#F8FAFC] mb-1">Investigation not found</p>
      <button onClick={() => navigate('/investigations')} className="btn btn-secondary btn-sm mt-2">
        Back to Investigations
      </button>
    </div>
  );

  const explanation = investigation.explanation;
  const timeline: TimelineEvent[] = (investigation as unknown as { timeline?: TimelineEvent[] }).timeline || [];
  const level = investigation.risk_level;
  const score = investigation.risk_score;

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
          <button onClick={() => navigate('/investigations')} className="text-[#64748B] hover:text-[#94A3B8] p-1 rounded">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-semibold text-[#F8FAFC]">
                Case {investigation.case_id}
              </span>
              <RiskBadge level={level} />
              <span className={STATUS_CLS[selectedStatus] || 'badge'}>{selectedStatus}</span>
            </div>
            <p className="text-[11px] text-[#475569] mt-0.5">
              {investigation.customer_name} · Created {new Date(investigation.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={e => handleStatus(e.target.value)}
            className="field-input py-1.5 text-[12px] w-auto cursor-pointer"
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
        </div>
      </div>

      {/* Risk Banner */}
      {score != null && level && (
        <div
          className="panel px-4 py-3 flex items-center gap-5"
          style={{ background: LEVEL_BG[level] || '#0F172A', borderColor: LEVEL_BORDER[level] || '#1E2D42' }}
        >
          <RiskGauge score={score} size={130} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[28px] font-bold text-[#F8FAFC] leading-none">{score.toFixed(0)}</span>
              <span className="text-[14px] text-[#64748B]">/100</span>
              <RiskBadge level={level} />
            </div>
            <p className="text-[12px] text-[#64748B]">
              {investigation.risk_factors.length} risk factors · Confidence: {score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low'}
            </p>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Left: Details + Timeline + Anomaly */}
        <div className="xl:col-span-3 space-y-4">
          {/* Case Summary */}
          <div className="panel p-4">
            <h3 className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em] mb-2">Case Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6">
              <InfoBlock label="Customer" value={investigation.customer_name} />
              <InfoBlock label="Customer ID" value={investigation.customer_id} mono />
              <InfoBlock label="Transaction" value={`₹${investigation.transaction_amount.toLocaleString('en-IN')}`} />
              <InfoBlock label="Type" value={investigation.transaction_type} />
              <InfoBlock label="Current Location" value={investigation.current_location || investigation.location || '—'} />
              <InfoBlock label="Previous Location" value={investigation.previous_location || '—'} />
              <InfoBlock label="Device" value={`${investigation.device_type}${investigation.is_new_device ? ' · NEW' : ''}`} />
              <InfoBlock label="Login Time" value={investigation.login_time || '—'} />
              <InfoBlock label="Frequency" value={`${investigation.transaction_frequency} txn/day`} />
            </div>
          </div>

          {/* Risk Factors */}
          <div className="panel p-4">
            <h3 className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em] mb-3">
              Risk Factors ({investigation.risk_factors.length})
            </h3>
            <RiskFactorCard factors={investigation.risk_factors} />
          </div>

          {/* Anomaly */}
          {explanation?.anomaly && (
            <div className="panel p-4">
              <AnomalyPanel anomaly={explanation.anomaly} />
            </div>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <div className="panel p-4">
              <h3 className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em] mb-3">
                Case Timeline
              </h3>
              <RiskTimeline events={timeline} />
            </div>
          )}
        </div>

        {/* Right: Explanation + Recommendation */}
        <div className="xl:col-span-2 space-y-4">
          {explanation && (
            <>
              <div className="panel p-4">
                <AIExplanationCard explanation={explanation} />
              </div>
              <div className="panel p-4">
                <RecommendationCard
                  recommendation={explanation.recommendation}
                  riskLevel={level!}
                  onAction={handleStatus}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
