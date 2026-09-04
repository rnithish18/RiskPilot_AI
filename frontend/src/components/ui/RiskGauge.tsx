import type { RiskLevel } from '../../types';

const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#22C55E',
  MEDIUM: '#F59E0B',
  HIGH: '#F97316',
  CRITICAL: '#EF4444',
};

function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return 'LOW';
  if (score <= 60) return 'MEDIUM';
  if (score <= 80) return 'HIGH';
  return 'CRITICAL';
}

interface RiskGaugeProps { score: number; size?: number; }

export default function RiskGauge({ score, size = 180 }: RiskGaugeProps) {
  const clamped = Math.min(Math.max(score, 0), 100);
  const level = getRiskLevel(clamped);
  const color = RISK_COLORS[level];

  const cx = size / 2;
  const cy = size * 0.58;
  const r = size * 0.38;
  const circumference = Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;
  const needleAngle = -180 + (clamped / 100) * 180;

  // Zone arcs
  const zones: { start: number; end: number; color: string }[] = [
    { start: 0, end: 30, color: '#22C55E' },
    { start: 30, end: 60, color: '#F59E0B' },
    { start: 60, end: 80, color: '#F97316' },
    { start: 80, end: 100, color: '#EF4444' },
  ];

  function arcPath(startPct: number, endPct: number) {
    const sa = Math.PI + (startPct / 100) * Math.PI;
    const ea = Math.PI + (endPct / 100) * Math.PI;
    const x1 = cx + r * Math.cos(sa);
    const y1 = cy + r * Math.sin(sa);
    const x2 = cx + r * Math.cos(ea);
    const y2 = cy + r * Math.sin(ea);
    const largeArc = endPct - startPct > 50 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={cy + 12} viewBox={`0 0 ${size} ${cy + 12}`}>
        {/* Zone stripes */}
        {zones.map((z, i) => (
          <path key={i} d={arcPath(z.start, z.end)} fill="none" stroke={z.color}
            strokeWidth={3} strokeLinecap="butt" opacity={0.18} />
        ))}
        {/* Track */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#1E2D42" strokeWidth={10} strokeLinecap="round" />
        {/* Score arc */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }} />
        {/* Needle */}
        <g transform={`rotate(${needleAngle}, ${cx}, ${cy})`} style={{ transition: 'transform 0.8s ease' }}>
          <line x1={cx} y1={cy} x2={cx + r - 12} y2={cy}
            stroke="#F8FAFC" strokeWidth={1.5} strokeLinecap="round" opacity={0.8} />
          <circle cx={cx} cy={cy} r={4} fill="#1E2D42" stroke="#F8FAFC" strokeWidth={1.5} />
        </g>
        {/* Score */}
        <text x={cx} y={cy - 14} textAnchor="middle" fill="#F8FAFC"
          fontSize={size * 0.15} fontWeight="700" fontFamily="Inter">
          {Math.round(clamped)}
        </text>
        <text x={cx} y={cy - 2} textAnchor="middle" fill="#64748B"
          fontSize={size * 0.07} fontFamily="Inter">
          /100
        </text>
      </svg>
    </div>
  );
}
