import type { RiskFactor } from '../../types';

interface RiskFactorListProps {
  factors: RiskFactor[];
}

const IMPACT_COLOR: Record<string, string> = {
  LOW: '#22C55E',
  MEDIUM: '#F59E0B',
  HIGH: '#F97316',
  CRITICAL: '#EF4444',
};

const IMPACT_BG: Record<string, string> = {
  LOW: 'rgba(34,197,94,0.1)',
  MEDIUM: 'rgba(245,158,11,0.1)',
  HIGH: 'rgba(249,115,22,0.1)',
  CRITICAL: 'rgba(239,68,68,0.1)',
};

export default function RiskFactorList({ factors }: RiskFactorListProps) {
  if (!factors.length) {
    return <p className="text-[#64748B] text-[13px] py-4">No risk factors detected.</p>;
  }

  const sorted = [...factors].sort((a, b) => b.score_contribution - a.score_contribution);
  const maxScore = sorted[0]?.score_contribution || 30;

  return (
    <div className="space-y-0 divide-y divide-[#1E2D42]">
      {sorted.map((factor, i) => {
        const color = IMPACT_COLOR[factor.impact] || '#94A3B8';
        const bg = IMPACT_BG[factor.impact] || 'rgba(148,163,184,0.1)';
        const pct = Math.min((factor.score_contribution / 30) * 100, 100);
        return (
          <div key={factor.id} className="py-3">
            <div className="flex items-start gap-3">
              {/* Rank */}
              <span className="text-[11px] font-mono text-[#64748B] w-5 shrink-0 mt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-[13px] font-medium text-[#F8FAFC]">{factor.factor_name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded"
                      style={{ color, background: bg }}
                    >
                      {factor.impact}
                    </span>
                    <span className="text-[13px] font-bold font-mono" style={{ color }}>
                      +{factor.score_contribution}
                    </span>
                  </div>
                </div>
                <p className="text-[12px] text-[#64748B] leading-relaxed mb-2">{factor.explanation}</p>
                {/* Bar */}
                <div className="h-[3px] bg-[#1E2D42] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: color, transition: 'width 0.6s ease' }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
