export interface RiskFactor {
  id: number;
  factor_name: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score_contribution: number;
  explanation: string;
}

export interface ExplanationData {
  summary: string;
  why_risky: string[];
  recommendation: {
    action: string;
    description: string;
    urgency: string;
    steps: string[];
    triggered_by?: string[];
  };
  anomaly: {
    normal_range: { min: number; max: number };
    current: number;
    previous_average: number;
    deviation_percent: number;
    is_anomalous: boolean;
    status: string;
    severity: string;
  };
}

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  type: 'info' | 'normal' | 'warning' | 'alert' | 'critical' | 'transaction';
}

export interface Assessment {
  id: number;
  case_id: string;
  customer_id: string;
  customer_name: string;
  transaction_amount: number;
  transaction_type: string;
  location: string;
  previous_average_amount: number;
  device_type: string;
  is_new_device: boolean;
  login_time: string;
  previous_location: string;
  current_location: string;
  transaction_frequency: number;
  account_age_days: number;
  previous_risk_score: number;
  risk_score: number | null;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  explanation: ExplanationData | null;
  recommendation: string | null;
  status: 'Open' | 'Under Review' | 'Approved' | 'Escalated' | 'Resolved';
  created_at: string;
  analyzed_at: string | null;
  risk_factors: RiskFactor[];
  timeline?: TimelineEvent[];
}

export interface DashboardStats {
  total_assessments: number;
  low_count: number;
  medium_count: number;
  high_count: number;
  critical_count: number;
  recent_events: Assessment[];
  risk_trend: { date: string; low: number; medium: number; high: number; critical: number }[];
  risk_by_category: { name: string; value: number }[];
}

export interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  case_id: string | null;
  description: string;
}

export interface AnalyticsData {
  risk_distribution: { name: string; value: number; color: string }[];
  risk_by_location: { location: string; count: number; avg_score: number }[];
  risk_by_type: { type: string; count: number; avg_score: number }[];
  risk_trend: { date: string; avg_score: number; count: number }[];
  avg_risk_score: number;
  critical_over_time: { date: string; count: number }[];
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CaseStatus = 'Open' | 'Under Review' | 'Approved' | 'Escalated' | 'Resolved';

export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

export const RISK_BG_CLASSES: Record<RiskLevel, string> = {
  LOW: 'bg-green-500/10 text-green-400 border-green-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export const STATUS_CLASSES: Record<string, string> = {
  Open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Under Review': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  Escalated: 'bg-red-500/10 text-red-400 border-red-500/20',
  Resolved: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};
