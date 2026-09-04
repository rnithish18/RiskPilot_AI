import { useLocation } from 'react-router-dom';
import { Bell, Menu, ChevronDown } from 'lucide-react';

const PAGE_META: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Dashboard', description: 'Real-time risk intelligence across your organization' },
  '/assess': { title: 'New Assessment', description: 'Submit a transaction for risk analysis' },
  '/investigations': { title: 'Investigations', description: 'Review and manage flagged risk cases' },
  '/analytics': { title: 'Analytics', description: 'Risk trends, patterns, and behavioral insights' },
  '/reports': { title: 'Reports', description: 'Generate and download investigation reports' },
  '/audit': { title: 'Audit Log', description: 'Complete record of all system actions' },
};

interface TopNavProps { onMenuClick: () => void; }

export default function TopNav({ onMenuClick }: TopNavProps) {
  const { pathname } = useLocation();

  const isResult = pathname.startsWith('/assess/result');
  const isDetail = /^\/investigations\/\d+$/.test(pathname);

  const meta = isResult
    ? { title: 'Assessment Result', description: 'AI risk analysis output' }
    : isDetail
    ? { title: 'Investigation Detail', description: 'Case file and risk breakdown' }
    : PAGE_META[pathname] ?? { title: 'RiskPilot', description: '' };

  return (
    <header className="h-12 flex items-center justify-between px-5 border-b border-[#1E2D42] bg-[#0B1120] shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[#64748B] hover:text-white p-1 rounded"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-[13px] font-semibold text-[#F8FAFC] leading-tight">{meta.title}</h1>
          {meta.description && (
            <p className="text-[11px] text-[#64748B] leading-tight hidden sm:block">{meta.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Demo Environment badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#111827] border border-[#243047] px-2.5 py-1 rounded text-[11px] text-[#64748B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
          Demo Environment
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-[#64748B] hover:text-[#94A3B8] rounded hover:bg-[rgba(255,255,255,0.04)]">
          <Bell size={16} strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-1.5 pl-1">
          <div className="w-7 h-7 rounded bg-[#1D3461] flex items-center justify-center">
            <span className="text-[10px] font-semibold text-[#60A5FA]">AD</span>
          </div>
          <span className="text-[12px] text-[#64748B] hidden sm:block">Admin</span>
        </div>
      </div>
    </header>
  );
}
