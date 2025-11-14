/**
 * Toast Helper Functions
 *
 * Provides convenient functions for showing toast notifications
 * using sonner library with consistent styling.
 */

import { toast as sonnerToast, type ExternalToast } from 'sonner';

/**
 * Toast configuration options
 */
type ToastOptions = ExternalToast;

/**
 * Shows a success toast notification
 *
 * @example
 * toast.success('保存しました');
 * toast.success('保存しました', { description: '変更が正常に保存されました' });
 */
function success(message: string, options?: ToastOptions) {
  return sonnerToast.success(message, {
    ...options,
    duration: options?.duration ?? 4000,
  });
}

/**
 * Shows an error toast notification
 *
 * @example
 * toast.error('エラーが発生しました');
 * toast.error('保存に失敗しました', { description: 'もう一度お試しください' });
 */
function error(message: string, options?: ToastOptions) {
  return sonnerToast.error(message, {
    ...options,
    duration: options?.duration ?? 5000,
  });
}

/**
 * Shows an info toast notification
 *
 * @example
 * toast.info('処理を開始しました');
 */
function info(message: string, options?: ToastOptions) {
  return sonnerToast.info(message, {
    ...options,
    duration: options?.duration ?? 4000,
  });
}

/**
 * Shows a warning toast notification
 *
 * @example
 * toast.warning('この操作は取り消せません');
 */
function warning(message: string, options?: ToastOptions) {
  return sonnerToast.warning(message, {
    ...options,
    duration: options?.duration ?? 4000,
  });
}

/**
 * Shows a loading toast notification
 * Returns a function to dismiss the toast
 *
 * @example
 * const toastId = toast.loading('処理中...');
 * // ... async operation
 * toast.success('完了しました', { id: toastId });
 */
function loading(message: string, options?: Omit<ToastOptions, 'action' | 'cancel'>) {
  return sonnerToast.loading(message, {
    ...options,
    duration: Infinity,
  });
}

/**
 * Shows a promise-based toast notification
 * Automatically updates based on promise state
 *
 * @example
 * toast.promise(
 *   saveData(),
 *   {
 *     loading: '保存中...',
 *     success: '保存しました',
 *     error: '保存に失敗しました',
 *   }
 * );
 */
function promise<T>(
  promise: Promise<T>,
  msgs: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) {
  return sonnerToast.promise(promise, msgs);
}

/**
 * Dismisses a toast by ID or all toasts
 *
 * @example
 * const toastId = toast.loading('処理中...');
 * toast.dismiss(toastId);
 *
 * // Dismiss all toasts
 * toast.dismiss();
 */
function dismiss(toastId?: string | number) {
  return sonnerToast.dismiss(toastId);
}

/**
 * Custom toast with full control
 *
 * @example
 * toast.custom('カスタムメッセージ', { duration: 3000 });
 */
function custom(message: string, options?: ToastOptions) {
  return sonnerToast(message, {
    ...options,
    duration: options?.duration ?? 4000,
  });
}

/**
 * Toast helper object
 */
export const toast = {
  success,
  error,
  info,
  warning,
  loading,
  promise,
  dismiss,
  custom,
};
