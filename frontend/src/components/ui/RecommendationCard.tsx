import { CheckCircle2 } from 'lucide-react';
import type { ExplanationData, RiskLevel } from '../../types';

interface RecommendationCardProps {
  recommendation: ExplanationData['recommendation'];
  riskLevel: RiskLevel;
  onAction?: (status: string) => void;
}

const URGENCY_COLOR: Record<string, string> = {
  LOW: '#22C55E', MEDIUM: '#F59E0B', HIGH: '#F97316', CRITICAL: '#EF4444',
};

const ACTION_BUTTONS = [
  { label: 'Approve', status: 'Approved', cls: 'btn btn-sm text-[#4ADE80] border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.06)] hover:bg-[rgba(34,197,94,0.12)]' },
  { label: 'Under Review', status: 'Under Review', cls: 'btn btn-sm text-[#FCD34D] border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.06)] hover:bg-[rgba(245,158,11,0.12)]' },
  { label: 'Escalate', status: 'Escalated', cls: 'btn btn-sm text-[#F87171] border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.06)] hover:bg-[rgba(239,68,68,0.12)]' },
  { label: 'Resolve', status: 'Resolved', cls: 'btn btn-sm text-[#94A3B8] border-[rgba(148,163,184,0.2)] bg-[rgba(148,163,184,0.06)] hover:bg-[rgba(148,163,184,0.12)]' },
];

export default function RecommendationCard({ recommendation, riskLevel, onAction }: RecommendationCardProps) {
  const urgencyColor = URGENCY_COLOR[recommendation.urgency] || '#94A3B8';
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">
          Recommended Action
        </span>
        <span
          className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
          style={{ color: urgencyColor, background: `${urgencyColor}18` }}
        >
          {recommendation.urgency} urgency
        </span>
      </div>
      <p className="text-[14px] font-semibold text-[#F8FAFC] mb-1">{recommendation.action}</p>
      <p className="text-[12px] text-[#94A3B8] leading-relaxed mb-3">{recommendation.description}</p>

      {recommendation.steps?.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {recommendation.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-[#3B82F6] mt-0.5 shrink-0" strokeWidth={2.5} />
              <span className="text-[12px] text-[#94A3B8]">{step}</span>
            </div>
          ))}
        </div>
      )}

      {onAction && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-[#1E2D42]">
          {ACTION_BUTTONS.map((btn) => (
            <button key={btn.label} onClick={() => onAction(btn.status)} className={btn.cls}>
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
