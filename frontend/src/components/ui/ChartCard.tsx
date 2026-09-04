import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export default function ChartCard({ title, subtitle, children, className = '', action }: ChartCardProps) {
  return (
    <div className={`panel p-4 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-semibold text-[#F8FAFC]">{title}</h3>
          {subtitle && <p className="text-[11px] text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
