import React from 'react';
import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  iconBg?: string;
  trend?: { value: number; label: string };
  accent?: string;
}

export default function StatCard({ label, value, icon, iconBg = 'bg-blue-500/20', trend, accent }: StatCardProps) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-3xl font-bold ${accent || 'text-white'}`}>{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 text-xs">
          {trend.value >= 0 ? (
            <TrendingUp size={12} className="text-green-400" />
          ) : (
            <TrendingDown size={12} className="text-red-400" />
          )}
          <span className={trend.value >= 0 ? 'text-green-400' : 'text-red-400'}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-slate-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
