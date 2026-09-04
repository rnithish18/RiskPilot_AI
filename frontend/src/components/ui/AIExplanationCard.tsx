import { ShieldAlert } from 'lucide-react';
import type { ExplanationData } from '../../types';

interface AIExplanationCardProps { explanation: ExplanationData; }

export default function AIExplanationCard({ explanation }: AIExplanationCardProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert size={14} className="text-[#60A5FA]" strokeWidth={2} />
        <span className="text-[11px] font-semibold text-[#60A5FA] uppercase tracking-[0.06em]">
          Why was this flagged?
        </span>
      </div>
      <p className="text-[13px] text-[#94A3B8] leading-relaxed mb-3">{explanation.summary}</p>
      {explanation.why_risky.length > 0 && (
        <ul className="space-y-1.5">
          {explanation.why_risky.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] text-[#94A3B8]">
              <span className="mt-[5px] w-1 h-1 rounded-full bg-[#3B82F6] shrink-0" />
              {reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
