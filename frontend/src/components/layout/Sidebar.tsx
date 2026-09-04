import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Search, BarChart3,
  FileText, ScrollText, Settings, ShieldCheck, X, CheckCircle2,
  Activity
} from 'lucide-react';
import { useToast } from '../ui/Toast';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    label: 'Risk Operations',
    items: [
      { icon: ClipboardList, label: 'Assessments', to: '/assess' },
      { icon: Search, label: 'Investigations', to: '/investigations' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { icon: BarChart3, label: 'Analytics', to: '/analytics' },
      { icon: FileText, label: 'Reports', to: '/reports' },
    ],
  },
  {
    label: 'Governance',
    items: [
      { icon: ScrollText, label: 'Audit Log', to: '/audit' },
    ],
  },
];

function NavItem({
  icon: Icon, label, to, onClick,
}: { icon: React.ElementType; label: string; to: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-[7px] rounded-none mx-0 text-[13px] font-medium border-l-2 transition-colors ${
          isActive
            ? 'nav-active border-[#3B82F6] bg-[rgba(59,130,246,0.06)]'
            : 'border-transparent text-[#64748B] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.03)]'
        }`
      }
    >
      <Icon size={15} strokeWidth={1.7} />
      <span>{label}</span>
    </NavLink>
  );
}

interface SidebarProps { mobileOpen: boolean; onClose: () => void; }

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { toast } = useToast();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-[#1E2D42]">
        <div className="w-7 h-7 bg-[#1D3461] rounded flex items-center justify-center shrink-0">
          <ShieldCheck size={15} className="text-[#60A5FA]" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#F8FAFC] leading-tight">RiskPilot</p>
          <p className="text-[10px] text-[#475569] leading-tight">AI Risk Intelligence</p>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-4 py-1 text-[10px] font-semibold text-[#374151] uppercase tracking-[0.08em] mb-0.5">
              {group.label}
            </p>
            {group.items.map((item) => (
              <NavItem key={item.to} {...item} onClick={onClose} />
            ))}
          </div>
        ))}

        {/* Settings */}
        <div className="mb-4">
          <p className="px-4 py-1 text-[10px] font-semibold text-[#374151] uppercase tracking-[0.08em] mb-0.5">
            System
          </p>
          <button
            onClick={() => toast('info', 'Settings', 'Available in a future release.')}
            className="flex items-center gap-2.5 px-3 py-[7px] w-full border-l-2 border-transparent text-[13px] font-medium text-[#64748B] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.03)]"
          >
            <Settings size={15} strokeWidth={1.7} />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#1E2D42]">
        <div className="flex items-center gap-2 mb-1.5">
          <CheckCircle2 size={12} className="text-[#22C55E] shrink-0" strokeWidth={2.5} />
          <span className="text-[11px] text-[#4B5563]">All systems operational</span>
        </div>
        <p className="text-[10px] text-[#374151]">v1.0.0 · Demo Environment</p>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-[#0B1120] border-r border-[#1E2D42] h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-[#0B1120] border-r border-[#1E2D42]">
            <button onClick={onClose} className="absolute top-3 right-3 text-[#64748B] hover:text-white p-1">
              <X size={18} />
            </button>
            <SidebarContent onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
