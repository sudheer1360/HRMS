import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  /** Show any toast type */
  showToast: (type: ToastType, message: string) => void;
  /** Shortcut: success toast */
  toast: (message: string) => void;
  /** Shortcut: error toast */
  toastError: (message: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  toast: () => {},
  toastError: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const toast    = useCallback((msg: string) => showToast('success', msg), [showToast]);
  const toastError = useCallback((msg: string) => showToast('error',   msg), [showToast]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toast, toastError }}>
      {children}
      {/* Portal-style fixed container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastBubble key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Single toast bubble ────────────────────────────────────────────────────────

const CONFIG: Record<ToastType, { icon: React.ReactNode; border: string; bg: string; text: string }> = {
  success: {
    icon:   <CheckCircle2 size={16} className="shrink-0 text-green-600" />,
    border: 'border-green-200',
    bg:     'bg-green-50',
    text:   'text-green-900',
  },
  error: {
    icon:   <XCircle size={16} className="shrink-0 text-red-600" />,
    border: 'border-red-200',
    bg:     'bg-red-50',
    text:   'text-red-900',
  },
  warning: {
    icon:   <AlertCircle size={16} className="shrink-0 text-amber-600" />,
    border: 'border-amber-200',
    bg:     'bg-amber-50',
    text:   'text-amber-900',
  },
  info: {
    icon:   <Info size={16} className="shrink-0 text-blue-600" />,
    border: 'border-blue-200',
    bg:     'bg-blue-50',
    text:   'text-blue-900',
  },
};

function ToastBubble({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const c = CONFIG[item.type];
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-in fade-in slide-in-from-right-4 duration-200 ${c.border} ${c.bg}`}
    >
      {c.icon}
      <p className={`flex-1 text-sm font-medium leading-snug ${c.text}`}>{item.message}</p>
      <button
        onClick={() => onDismiss(item.id)}
        className="ml-1 shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
