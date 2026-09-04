import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={15} style={{ color: '#22C55E' }} />,
  error: <XCircle size={15} style={{ color: '#EF4444' }} />,
  warning: <AlertTriangle size={15} style={{ color: '#F59E0B' }} />,
  info: <Info size={15} style={{ color: '#3B82F6' }} />,
};

const BG: Record<ToastType, string> = {
  success: 'border-green-500/30 bg-green-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
};

const BORDER: Record<ToastType, string> = {
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  return (
    <div
      className="flex items-start gap-3 px-3.5 py-3 mb-2 min-w-[280px] max-w-[380px] rounded-lg"
      style={{
        background: '#111827',
        border: `1px solid ${BORDER[toast.type]}40`,
        borderLeft: `3px solid ${BORDER[toast.type]}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      }}
    >
      <div className="mt-0.5 shrink-0">{ICONS[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#F8FAFC]">{toast.title}</p>
        {toast.message && <p className="text-[11px] text-[#64748B] mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={() => onClose(toast.id)} className="text-[#475569] hover:text-[#94A3B8] shrink-0 p-0.5">
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
