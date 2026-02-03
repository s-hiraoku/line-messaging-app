"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { AlertCircle } from "lucide-react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | undefined>(
  undefined
);

export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirm must be used within ConfirmDialogProvider");
  }
  return context;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
    setOptions(null);
    setResolvePromise(null);
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setOptions(null);
    setResolvePromise(null);
  }, [resolvePromise]);

  const typeStyles = {
    danger: "rounded-xl bg-red-50 text-red-600 shadow-[inset_0_-4px_12px_rgba(239,68,68,0.1),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(239,68,68,0.2)]",
    warning: "rounded-xl bg-[#FFE500] text-amber-900 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.1),inset_0_2px_6px_rgba(255,255,255,0.5),0_4px_12px_rgba(255,229,0,0.3)]",
    info: "rounded-xl bg-white text-gray-700 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.08)]",
  };

  const buttonStyles = {
    danger: "rounded-xl bg-red-500 text-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.2),inset_0_2px_6px_rgba(255,255,255,0.3),0_6px_16px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 hover:shadow-[inset_0_-4px_12px_rgba(0,0,0,0.2),inset_0_2px_6px_rgba(255,255,255,0.3),0_8px_20px_rgba(239,68,68,0.5)] active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.2),0_2px_8px_rgba(239,68,68,0.3)]",
    warning: "rounded-xl bg-[#FFE500] text-amber-900 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.1),inset_0_2px_6px_rgba(255,255,255,0.5),0_6px_16px_rgba(255,229,0,0.4)] hover:-translate-y-0.5 hover:shadow-[inset_0_-4px_12px_rgba(0,0,0,0.1),inset_0_2px_6px_rgba(255,255,255,0.5),0_8px_20px_rgba(255,229,0,0.5)] active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.15),0_2px_8px_rgba(255,229,0,0.3)]",
    info: "rounded-xl bg-[#00B900] text-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.2),inset_0_2px_6px_rgba(255,255,255,0.3),0_6px_16px_rgba(0,185,0,0.4)] hover:-translate-y-0.5 hover:shadow-[inset_0_-4px_12px_rgba(0,0,0,0.2),inset_0_2px_6px_rgba(255,255,255,0.3),0_8px_20px_rgba(0,185,0,0.5)] active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.2),0_2px_8px_rgba(0,185,0,0.3)]",
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_16px_48px_rgba(0,0,0,0.2)]">
            <div className="mb-4 flex items-start gap-3">
              <div
                className={`p-2 ${typeStyles[options.type || "info"]}`}
              >
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold uppercase tracking-wider text-gray-800">{options.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{options.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-700 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_6px_16px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_8px_20px_rgba(0,0,0,0.12)] active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.06)]"
              >
                {options.cancelText || "キャンセル"}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${buttonStyles[options.type || "info"]}`}
              >
                {options.confirmText || "確認"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}
