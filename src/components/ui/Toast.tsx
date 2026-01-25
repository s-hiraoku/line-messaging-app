"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 5000) => {
      const id = Math.random().toString(36).substring(7);
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, "success", duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast(message, "error", duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => showToast(message, "info", duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => showToast(message, "warning", duration),
    [showToast]
  );

  const toastStyles = {
    success: "rounded-xl bg-[#00B900] text-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.2),inset_0_2px_6px_rgba(255,255,255,0.3),0_8px_24px_rgba(0,185,0,0.4)]",
    error: "rounded-xl bg-red-500 text-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.2),inset_0_2px_6px_rgba(255,255,255,0.3),0_8px_24px_rgba(239,68,68,0.4)]",
    info: "rounded-xl bg-white text-gray-800 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.12)]",
    warning: "rounded-xl bg-[#FFE500] text-amber-900 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.1),inset_0_2px_6px_rgba(255,255,255,0.5),0_8px_24px_rgba(255,229,0,0.4)]",
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end gap-2 p-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all ${toastStyles[toast.type]}`}
          >
            {icons[toast.type]}
            <p>{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 transition hover:scale-110"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
