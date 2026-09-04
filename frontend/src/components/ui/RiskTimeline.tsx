import type { TimelineEvent } from '../../types';

interface RiskTimelineProps { events: TimelineEvent[]; }

const DOT: Record<string, string> = {
  info: 'bg-[#3B82F6]',
  normal: 'bg-[#475569]',
  warning: 'bg-[#F59E0B]',
  alert: 'bg-[#F97316]',
  critical: 'bg-[#EF4444]',
  transaction: 'bg-[#6366F1]',
};

export default function RiskTimeline({ events }: RiskTimelineProps) {
  return (
    <div className="space-y-0">
      {events.map((event, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${DOT[event.type] || 'bg-[#475569]'}`} />
            {i < events.length - 1 && (
              <div className="w-px flex-1 bg-[#1E2D42] mt-1 min-h-[20px]" />
            )}
          </div>
          <div className="pb-3 flex-1 min-w-0">
            <p className="text-[11px] font-mono text-[#475569] mb-0.5">{event.time}</p>
            <p className="text-[13px] font-medium text-[#F8FAFC]">{event.title}</p>
            <p className="text-[12px] text-[#64748B]">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
