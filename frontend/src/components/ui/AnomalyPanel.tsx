import { AlertTriangle, TrendingUp } from 'lucide-react';
import type { ExplanationData } from '../../types';

interface AnomalyPanelProps { anomaly: ExplanationData['anomaly']; }

export default function AnomalyPanel({ anomaly }: AnomalyPanelProps) {
  const { normal_range, current, deviation_percent, is_anomalous, status } = anomaly;
  const totalRange = Math.max(normal_range.max * 1.6, current * 1.1);
  const minPct = Math.min((normal_range.min / totalRange) * 100, 95);
  const maxPct = Math.min((normal_range.max / totalRange) * 100, 95);
  const currentPct = Math.min((current / totalRange) * 100, 97);
  const color = is_anomalous ? '#EF4444' : '#22C55E';

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {is_anomalous
            ? <AlertTriangle size={14} className="text-[#EF4444]" strokeWidth={2} />
            : <TrendingUp size={14} className="text-[#22C55E]" strokeWidth={2} />}
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">
            Behavioral Anomaly
          </span>
        </div>
        <span
          className="text-[11px] font-bold uppercase px-2 py-0.5 rounded"
          style={{ color, background: `${color}18` }}
        >
          {status}
        </span>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Historical Range', value: `₹${normal_range.min.toLocaleString('en-IN')} – ₹${normal_range.max.toLocaleString('en-IN')}`, mono: false },
          { label: 'Current Amount', value: `₹${current.toLocaleString('en-IN')}`, mono: false, highlight: color },
          { label: 'Deviation', value: `${deviation_percent >= 0 ? '+' : ''}${deviation_percent.toFixed(0)}%`, mono: true, highlight: color },
        ].map((m) => (
          <div key={m.label} className="bg-[#0F172A] border border-[#1E2D42] rounded p-2.5">
            <p className="text-[10px] text-[#64748B] uppercase tracking-[0.05em] mb-1">{m.label}</p>
            <p
              className={`text-[13px] font-semibold ${m.mono ? 'font-mono' : ''}`}
              style={{ color: m.highlight || '#F8FAFC' }}
            >
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Visual bar */}
      <div className="relative h-6 bg-[#111827] border border-[#1E2D42] rounded overflow-hidden">
        {/* Normal zone */}
        <div
          className="absolute top-0 bottom-0 bg-[rgba(34,197,94,0.08)] border-l border-r border-[rgba(34,197,94,0.2)]"
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
        />
        <span
          className="absolute top-1 text-[9px] text-[rgba(34,197,94,0.5)] select-none"
          style={{ left: `${minPct + 0.5}%` }}
        >
          NORMAL
        </span>
        {/* Current marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5"
          style={{ left: `${currentPct}%`, background: color }}
        >
          <div
            className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{ background: color }}
          />
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-[#374151] mt-1">
        <span>₹0</span>
        <span>₹{Math.round(totalRange).toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}
