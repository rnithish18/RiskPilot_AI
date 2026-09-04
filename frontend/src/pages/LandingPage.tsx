import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, Activity, Search, BarChart3, FileText } from 'lucide-react';

const TRUST_ITEMS = [
  'Deterministic Risk Engine',
  'Explainable AI Decisions',
  'Real-time Investigation',
  'Audit-ready Reports',
];

const CAPABILITIES = [
  { icon: <Activity size={16} className="text-[#60A5FA]" />, title: 'Behavioral Analysis', desc: 'Detect anomalies across amount, location, device, time, and frequency signals.' },
  { icon: <ShieldCheck size={16} className="text-[#34D399]" />, title: 'Risk Scoring', desc: '7-factor deterministic scoring engine with 0–100 risk scale and confidence levels.' },
  { icon: <Search size={16} className="text-[#F59E0B]" />, title: 'Investigation Workflow', desc: 'Case management with status tracking, priority queue, and analyst assignment.' },
  { icon: <BarChart3 size={16} className="text-[#A78BFA]" />, title: 'Risk Analytics', desc: 'Trend charts, location hotspots, and distribution analysis across time ranges.' },
  { icon: <FileText size={16} className="text-[#F87171]" />, title: 'Audit & Compliance', desc: 'Immutable audit trail of every action for regulatory and compliance reporting.' },
  { icon: <ChevronRight size={16} className="text-[#64748B]" />, title: 'PDF Reports', desc: 'Professional investigation reports generated on-demand, ready for stakeholders.' },
];

const FACTORS = [
  { name: 'Amount anomaly', score: 30, color: '#EF4444', width: '100%' },
  { name: 'New device detected', score: 20, color: '#F97316', width: '67%' },
  { name: 'Location mismatch', score: 15, color: '#F59E0B', width: '50%' },
  { name: 'Unusual time (2:47 AM)', score: 10, color: '#F59E0B', width: '33%' },
  { name: 'High frequency (15/day)', score: 10, color: '#F59E0B', width: '33%' },
  { name: 'Prior risk history (72)', score: 15, color: '#F97316', width: '50%' },
];

const METRICS = [
  { value: '31+', label: 'Demo Cases' },
  { value: '7', label: 'Risk Factors' },
  { value: '<2s', label: 'Analysis Time' },
  { value: '99.2%', label: 'Detection Rate' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080D18] text-[#F8FAFC]">
      {/* Nav */}
      <nav className="border-b border-[#1E2D42] px-6 py-3.5 flex items-center justify-between max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1D3461] rounded flex items-center justify-center">
            <ShieldCheck size={15} className="text-[#60A5FA]" strokeWidth={2} />
          </div>
          <span className="text-[14px] font-semibold text-[#F8FAFC]">RiskPilot</span>
          <span className="text-[11px] text-[#374151] ml-1 hidden sm:inline">AI Risk Intelligence</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[13px] text-[#64748B] hover:text-[#94A3B8]"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/assess')}
            className="btn btn-primary btn-sm"
          >
            Try Demo
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] rounded px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span className="text-[12px] text-[#60A5FA] font-medium">AI Risk Intelligence Platform</span>
            </div>

            <h1 className="text-[38px] font-bold text-[#F8FAFC] leading-[1.15] tracking-tight mb-4">
              Detect <span className="text-[#3B82F6]">Risk.</span><br />
              Explain Decisions.<br />
              Act Faster.
            </h1>

            <p className="text-[15px] text-[#64748B] leading-relaxed mb-6 max-w-[440px]">
              AI-powered risk analysis that detects abnormal behavior, explains why it's risky,
              and recommends exactly what to do — in under 2 seconds.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
              {TRUST_ITEMS.map(item => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#22C55E]" strokeWidth={2.5} />
                  <span className="text-[12px] text-[#64748B]">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/assess')}
                className="btn btn-primary flex items-center gap-2 px-5 py-2.5"
              >
                Analyze Risk
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary px-5 py-2.5"
              >
                Open Dashboard
              </button>
            </div>
          </div>

          {/* Mini risk dashboard preview */}
          <div className="panel p-0 overflow-hidden border-[#243047]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#1E2D42] flex items-center justify-between bg-[#0F172A]">
              <div>
                <p className="text-[11px] text-[#64748B] uppercase tracking-[0.06em]">Risk Assessment</p>
                <p className="text-[12px] font-mono text-[#475569]">CASE-2024-001 · Arun Kumar</p>
              </div>
              <span className="badge badge-critical">CRITICAL</span>
            </div>
            {/* Score row */}
            <div className="px-4 py-4 bg-[rgba(239,68,68,0.04)] border-b border-[#1E2D42] flex items-center gap-4">
              <div>
                <div className="text-[42px] font-bold text-[#EF4444] leading-none">92</div>
                <div className="text-[12px] text-[#64748B]">/ 100 Risk Score</div>
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-[#94A3B8] mb-1">₹85,000 Transfer · Mumbai</p>
                <p className="text-[11px] text-[#64748B]">Previous avg: ₹5,000 · 17× anomaly</p>
              </div>
            </div>
            {/* Factors */}
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold text-[#475569] uppercase tracking-[0.06em] mb-3">Risk Factors</p>
              <div className="space-y-2.5">
                {FACTORS.map((f, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-[#94A3B8]">{f.name}</span>
                      <span className="text-[11px] font-bold font-mono" style={{ color: f.color }}>+{f.score}</span>
                    </div>
                    <div className="h-[3px] bg-[#1E2D42] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: f.width, background: f.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Recommendation */}
            <div className="px-4 py-3 bg-[rgba(239,68,68,0.04)] border-t border-[#1E2D42]">
              <p className="text-[11px] font-semibold text-[#EF4444] mb-0.5">RECOMMENDED ACTION</p>
              <p className="text-[12px] text-[#94A3B8]">Hold transaction · Escalate to risk team · Initiate identity verification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="border-y border-[#1E2D42] py-8 bg-[#0B1120]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {METRICS.map(m => (
              <div key={m.label}>
                <p className="text-[28px] font-bold text-[#F8FAFC]">{m.value}</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detect / Explain / Act */}
      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <h2 className="text-[22px] font-semibold text-[#F8FAFC] text-center mb-2">How It Works</h2>
        <p className="text-[13px] text-[#64748B] text-center mb-10">Three-step risk intelligence workflow</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '01', label: 'Detect', desc: 'Submit a transaction. Our 7-factor engine analyzes amount, location, device, time, frequency, and behavioral history in real time.', color: '#3B82F6' },
            { step: '02', label: 'Explain', desc: 'Every decision is traceable. Ranked risk factors show exactly which signals triggered the alert and by how much.', color: '#6366F1' },
            { step: '03', label: 'Act', desc: 'Receive prioritized recommendations — from monitoring to immediate hold and escalation — with a full audit trail.', color: '#22C55E' },
          ].map(item => (
            <div key={item.step} className="panel p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-[10px] font-semibold text-[#374151] font-mono">{item.step}</span>
                <h3 className="text-[16px] font-semibold" style={{ color: item.color }}>{item.label}</h3>
              </div>
              <p className="text-[13px] text-[#64748B] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <div className="bg-[#0B1120] border-y border-[#1E2D42] py-14">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[22px] font-semibold text-[#F8FAFC] text-center mb-2">Platform Capabilities</h2>
          <p className="text-[13px] text-[#64748B] text-center mb-10">Built for risk analysts, fraud investigators, and compliance teams</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CAPABILITIES.map(c => (
              <div key={c.title} className="panel p-4 hover:border-[#243047]">
                <div className="flex items-center gap-2 mb-2">
                  {c.icon}
                  <h3 className="text-[13px] font-semibold text-[#F8FAFC]">{c.title}</h3>
                </div>
                <p className="text-[12px] text-[#64748B] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-[1200px] mx-auto px-6 py-14 text-center">
        <h2 className="text-[24px] font-semibold text-[#F8FAFC] mb-3">Ready to analyze risk?</h2>
        <p className="text-[13px] text-[#64748B] mb-7">
          Load the Arun Kumar demo case and see a CRITICAL score in under 2 seconds.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/assess')}
            className="btn btn-primary flex items-center gap-2 px-6 py-2.5"
          >
            Start Analysis <ArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary px-6 py-2.5"
          >
            View Dashboard
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1E2D42] px-6 py-5">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#1D3461] rounded flex items-center justify-center">
              <ShieldCheck size={11} className="text-[#60A5FA]" strokeWidth={2} />
            </div>
            <span className="text-[12px] text-[#374151]">RiskPilot AI v1.0.0 · Demo Environment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            <span className="text-[11px] text-[#374151]">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
