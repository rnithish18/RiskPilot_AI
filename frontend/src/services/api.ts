import axios from 'axios';
import type { Assessment, DashboardStats, AuditLog, AnalyticsData } from '../types';

const api = axios.create({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseURL: (import.meta as any).env?.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Intercept errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail || err.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const getDashboard = (): Promise<DashboardStats> =>
  api.get('/dashboard').then((r) => r.data);

export const getAssessments = (params?: Record<string, string>): Promise<Assessment[]> =>
  api.get('/assessments', { params }).then((r) => r.data);

export const createAssessment = (data: Record<string, unknown>): Promise<Assessment> =>
  api.post('/assessments', data).then((r) => r.data);

export const getAssessment = (id: number): Promise<Assessment> =>
  api.get(`/assessments/${id}`).then((r) => r.data);

export const analyzeAssessment = (id: number): Promise<Assessment> =>
  api.post(`/assessments/${id}/analyze`).then((r) => r.data);

export const getInvestigations = (params?: Record<string, string>): Promise<Assessment[]> =>
  api.get('/investigations', { params }).then((r) => r.data);

export const getInvestigation = (id: number): Promise<Assessment> =>
  api.get(`/investigations/${id}`).then((r) => r.data);

export const updateStatus = (id: number, status: string): Promise<unknown> =>
  api.patch(`/investigations/${id}/status`, { status }).then((r) => r.data);

export const getAnalytics = (range: string = '30d'): Promise<AnalyticsData> =>
  api.get('/analytics', { params: { range } }).then((r) => r.data);

export const getAuditLog = (): Promise<AuditLog[]> =>
  api.get('/audit').then((r) => r.data);

export const generateReport = (id: number): Promise<Blob> =>
  api.post(`/reports/${id}`, {}, { responseType: 'blob' }).then((r) => r.data);
