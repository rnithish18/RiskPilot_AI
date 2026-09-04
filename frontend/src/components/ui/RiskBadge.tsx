import type { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel | null;
  size?: 'xs' | 'sm' | 'md';
}

const CLASSES: Record<RiskLevel, string> = {
  LOW:      'badge badge-low',
  MEDIUM:   'badge badge-medium',
  HIGH:     'badge badge-high',
  CRITICAL: 'badge badge-critical',
};

const SIZES = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-[11px] px-2 py-[3px]',
  md: 'text-[11px] px-2.5 py-1',
};

export default function RiskBadge({ level, size = 'sm' }: RiskBadgeProps) {
  if (!level) return <span className="text-[#475569] text-[11px]">—</span>;
  return (
    <span className={`${CLASSES[level]} ${SIZES[size]}`}>
      {level}
    </span>
  );
}
