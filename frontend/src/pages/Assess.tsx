import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronRight, CheckCircle2 } from 'lucide-react';
import { createAssessment, analyzeAssessment } from '../services/api';
import { useToast } from '../components/ui/Toast';

const TRANSACTION_TYPES = ['Payment', 'Transfer', 'Withdrawal', 'Purchase', 'Refund', 'Login', 'Account Change', 'Other'];

const DEMO_DATA = {
  customer_name: 'Arun Kumar',
  customer_id: 'CUST-AK-001',
  transaction_amount: '85000',
  transaction_type: 'Transfer',
  location: 'Mumbai',
  previous_average_amount: '5000',
  device_type: 'Mobile',
  is_new_device: true,
  login_time: '02:47',
  previous_location: 'Chennai',
  current_location: 'Mumbai',
  transaction_frequency: '15',
  account_age_days: '180',
  previous_risk_score: '72',
};

type FormData = typeof DEMO_DATA & { is_new_device: boolean };

const EMPTY: FormData = {
  customer_name: '', customer_id: '', transaction_amount: '', transaction_type: 'Transfer',
  location: '', previous_average_amount: '', device_type: 'Mobile', is_new_device: false,
  login_time: '12:00', previous_location: '', current_location: '',
  transaction_frequency: '1', account_age_days: '365', previous_risk_score: '0',
};

const ANALYSIS_STEPS = [
  'Behavioral baseline',
  'Amount anomaly detection',
  'Location pattern analysis',
  'Device signal check',
  'Time anomaly detection',
  'Risk factor scoring',
  'Generating explanation',
];

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-medium text-[#64748B] uppercase tracking-[0.06em] mb-1.5">
      {children} {required && <span className="text-[#EF4444] normal-case">*</span>}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[11px] text-[#F87171] mt-1">{msg}</p>;
}

export default function Assess() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const navigate = useNavigate();
  const { toast } = useToast();

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // Risk preview computed values
  const amount = Number(form.transaction_amount) || 0;
  const avg = Number(form.previous_average_amount) || 0;
  const ratio = avg > 0 ? amount / avg : 0;
  const deviation = avg > 0 ? ((amount - avg) / avg) * 100 : 0;
  const locationChanged = form.current_location && form.previous_location && form.current_location !== form.previous_location;
  const hour = parseInt(form.login_time?.split(':')[0] || '12', 10);
  const unusualTime = hour >= 0 && hour <= 5;
  const highFreq = Number(form.transaction_frequency) > 10;

  const anomalySignal =
    ratio > 5 ? 'CRITICAL' :
    ratio > 3 ? 'HIGH' :
    ratio > 2 ? 'MEDIUM' :
    locationChanged || form.is_new_device ? 'MEDIUM' : 'LOW';

  const anomalyColor: Record<string, string> = {
    CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#F59E0B', LOW: '#22C55E'
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.customer_name.trim()) e.customer_name = 'Required';
    if (!form.customer_id.trim()) e.customer_id = 'Required';
    if (!form.transaction_amount || Number(form.transaction_amount) <= 0) e.transaction_amount = 'Enter a valid amount';
    if (!form.previous_average_amount || Number(form.previous_average_amount) <= 0) e.previous_average_amount = 'Enter a valid amount';
    if (!form.current_location.trim()) e.current_location = 'Required';
    if (!form.previous_location.trim()) e.previous_location = 'Required';
    const score = Number(form.previous_risk_score);
    if (isNaN(score) || score < 0 || score > 100) e.previous_risk_score = 'Must be 0–100';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast('error', 'Validation error', 'Please fix the highlighted fields.'); return; }
    setLoading(true);
    setStep(0);
    try {
      // Simulate step animation
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setStep(i);
        await new Promise(r => setTimeout(r, 180));
      }
      const payload = {
        ...form,
        transaction_amount: Number(form.transaction_amount),
        previous_average_amount: Number(form.previous_average_amount),
        transaction_frequency: Number(form.transaction_frequency),
        account_age_days: Number(form.account_age_days),
        previous_risk_score: Number(form.previous_risk_score),
      };
      const created = await createAssessment(payload);
      const analyzed = await analyzeAssessment(created.id);
      toast('success', 'Analysis complete', `Risk score: ${analyzed.risk_score?.toFixed(0)}/100 · ${analyzed.risk_level}`);
      navigate(`/assess/result/${analyzed.id}`);
    } catch (err: unknown) {
      setStep(-1);
      toast('error', 'Analysis failed', err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  };

  const inputCls = (field: string) =>
    `field-input ${errors[field] ? 'border-[rgba(239,68,68,0.5)]' : ''}`;

  return (
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[18px] font-semibold text-[#F8FAFC] tracking-tight">New Risk Assessment</h2>
          <p className="text-[12px] text-[#64748B] mt-0.5">Analyze a transaction for behavioral risk factors</p>
        </div>
        <button
          type="button"
          onClick={() => { setForm(DEMO_DATA); setErrors({}); }}
          className="btn btn-secondary btn-sm flex items-center gap-1.5 border-[rgba(245,158,11,0.3)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.06)]"
        >
          <Zap size={13} strokeWidth={2.5} />
          Load Demo Case
        </button>
      </div>

      {loading ? (
        /* Analysis progress state */
        <div className="panel p-8 text-center max-w-sm mx-auto">
          <div className="w-10 h-10 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-[14px] font-semibold text-[#F8FAFC] mb-4">Analyzing transaction...</p>
          <div className="space-y-2 text-left">
            {ANALYSIS_STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                {i < step ? (
                  <CheckCircle2 size={14} className="text-[#22C55E] shrink-0" strokeWidth={2.5} />
                ) : i === step ? (
                  <div className="w-3.5 h-3.5 border border-[#3B82F6] border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-[#243047] shrink-0" />
                )}
                <span className={`text-[12px] ${i <= step ? 'text-[#94A3B8]' : 'text-[#374151]'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* SECTION 1 — Customer */}
            <div className="panel p-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1E2D42]">
                <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-[0.08em]">01</span>
                <h3 className="text-[13px] font-semibold text-[#F8FAFC]">Customer</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label required>Customer Name</Label>
                  <input className={inputCls('customer_name')} value={form.customer_name}
                    onChange={e => set('customer_name', e.target.value)} placeholder="Full name" />
                  <ErrorMsg msg={errors.customer_name} />
                </div>
                <div>
                  <Label required>Customer ID</Label>
                  <input className={inputCls('customer_id')} value={form.customer_id}
                    onChange={e => set('customer_id', e.target.value)} placeholder="CUST-001" />
                  <ErrorMsg msg={errors.customer_id} />
                </div>
                <div>
                  <Label>Account Age (days)</Label>
                  <input type="number" className="field-input" value={form.account_age_days}
                    onChange={e => set('account_age_days', e.target.value)} min="0" />
                </div>
                <div>
                  <Label>Previous Risk Score (0–100)</Label>
                  <input type="number" className={inputCls('previous_risk_score')} value={form.previous_risk_score}
                    onChange={e => set('previous_risk_score', e.target.value)} min="0" max="100" />
                  <ErrorMsg msg={errors.previous_risk_score} />
                </div>
              </div>
            </div>

            {/* SECTION 2 — Transaction */}
            <div className="panel p-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1E2D42]">
                <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-[0.08em]">02</span>
                <h3 className="text-[13px] font-semibold text-[#F8FAFC]">Transaction</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label required>Transaction Amount (₹)</Label>
                  <input type="number" className={inputCls('transaction_amount')} value={form.transaction_amount}
                    onChange={e => set('transaction_amount', e.target.value)} placeholder="0" min="0" />
                  <ErrorMsg msg={errors.transaction_amount} />
                </div>
                <div>
                  <Label required>Historical Average (₹)</Label>
                  <input type="number" className={inputCls('previous_average_amount')} value={form.previous_average_amount}
                    onChange={e => set('previous_average_amount', e.target.value)} placeholder="0" min="0" />
                  <ErrorMsg msg={errors.previous_average_amount} />
                </div>
                <div>
                  <Label>Transaction Type</Label>
                  <select className="field-input" value={form.transaction_type}
                    onChange={e => set('transaction_type', e.target.value)}>
                    {TRANSACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Transactions Today</Label>
                  <input type="number" className="field-input" value={form.transaction_frequency}
                    onChange={e => set('transaction_frequency', e.target.value)} min="0" />
                </div>
                <div>
                  <Label>Display Location</Label>
                  <input className="field-input" value={form.location}
                    onChange={e => set('location', e.target.value)} placeholder="e.g. Mumbai, India" />
                </div>
              </div>
            </div>

            {/* SECTION 3 — Context */}
            <div className="panel p-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1E2D42]">
                <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-[0.08em]">03</span>
                <h3 className="text-[13px] font-semibold text-[#F8FAFC]">Context</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label required>Previous Location</Label>
                    <input className={inputCls('previous_location')} value={form.previous_location}
                      onChange={e => set('previous_location', e.target.value)} placeholder="Chennai" />
                    <ErrorMsg msg={errors.previous_location} />
                  </div>
                  <div>
                    <Label required>Current Location</Label>
                    <input className={inputCls('current_location')} value={form.current_location}
                      onChange={e => set('current_location', e.target.value)} placeholder="Mumbai" />
                    <ErrorMsg msg={errors.current_location} />
                  </div>
                </div>
                <div>
                  <Label>Device Type</Label>
                  <input className="field-input" value={form.device_type}
                    onChange={e => set('device_type', e.target.value)} placeholder="Mobile / Desktop" />
                </div>
                <div>
                  <Label>Login Time</Label>
                  <input type="time" className="field-input" value={form.login_time}
                    onChange={e => set('login_time', e.target.value)} />
                </div>
                <div>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => set('is_new_device', !form.is_new_device)}
                      className={`w-9 h-5 rounded-full relative transition-colors ${form.is_new_device ? 'bg-[#3B82F6]' : 'bg-[#1E2D42]'}`}
                    >
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_new_device ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <span className="text-[13px] text-[#94A3B8]">
                      New / unrecognized device
                    </span>
                  </label>
                </div>

                {/* Risk preview */}
                {amount > 0 && avg > 0 && (
                  <div className="mt-2 p-3 bg-[#0F172A] border border-[#243047] rounded">
                    <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.06em] mb-2">Risk Preview</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-[#64748B]">Amount ratio</span>
                        <span className="text-[#F8FAFC] font-mono">{ratio.toFixed(1)}×</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-[#64748B]">Deviation</span>
                        <span className="text-[#F8FAFC] font-mono">{deviation >= 0 ? '+' : ''}{deviation.toFixed(0)}%</span>
                      </div>
                      {locationChanged && (
                        <div className="flex justify-between text-[12px]">
                          <span className="text-[#64748B]">Location</span>
                          <span className="text-[#F59E0B]">Changed</span>
                        </div>
                      )}
                      {unusualTime && (
                        <div className="flex justify-between text-[12px]">
                          <span className="text-[#64748B]">Time</span>
                          <span className="text-[#F59E0B]">Unusual</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-[12px] pt-1 border-t border-[#1E2D42]">
                        <span className="text-[#64748B]">Likely signal</span>
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{
                          color: anomalyColor[anomalySignal],
                          background: `${anomalyColor[anomalySignal]}18`
                        }}>{anomalySignal}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 mt-4">
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2 px-6 py-2.5"
            >
              Analyze Risk
              <ChevronRight size={15} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => { setForm(EMPTY); setErrors({}); }}
              className="btn btn-secondary"
            >
              Clear Form
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
