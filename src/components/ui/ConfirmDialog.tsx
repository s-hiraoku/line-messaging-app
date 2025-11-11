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
    danger: "border-red-500/50 bg-red-500/10 text-red-400",
    warning: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
    info: "border-blue-500/50 bg-blue-500/10 text-blue-400",
  };

  const buttonStyles = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-yellow-600 hover:bg-yellow-700",
    info: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-slate-700/50 bg-slate-800/95 p-6 shadow-2xl">
            <div className="mb-4 flex items-start gap-3">
              <div
                className={`rounded-full border p-2 ${typeStyles[options.type || "info"]}`}
              >
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{options.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{options.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="rounded-md border border-slate-600 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/60"
              >
                {options.cancelText || "キャンセル"}
              </button>
              <button
                onClick={handleConfirm}
                className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition ${buttonStyles[options.type || "info"]}`}
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
