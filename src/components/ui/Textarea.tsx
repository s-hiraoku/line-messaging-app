import { TextareaHTMLAttributes, forwardRef, useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const textareaVariants = cva(
  'w-full rounded-lg border bg-slate-900/50 px-4 py-2 text-slate-100 placeholder:text-slate-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed resize-y',
  {
    variants: {
      variant: {
        default:
          'border-slate-700/50 hover:border-slate-600/50 focus:border-blue-500/50 focus:ring-blue-500/50',
        error:
          'border-red-500/50 hover:border-red-400/50 focus:border-red-500 focus:ring-red-500/50',
      },
      textareaSize: {
        sm: 'px-3 py-1.5 text-sm min-h-[80px]',
        md: 'px-4 py-2 text-base min-h-[120px]',
        lg: 'px-5 py-3 text-lg min-h-[160px]',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      variant: 'default',
      textareaSize: 'md',
      resize: 'vertical',
    },
  }
);

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: string;
  autoResize?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      textareaSize,
      resize,
      error,
      autoResize = false,
      maxLength,
      showCharCount = false,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const effectiveVariant = hasError ? 'error' : variant;
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const charCount = typeof value === 'string' ? value.length : 0;

    // Handle auto-resize
    useEffect(() => {
      if (autoResize && internalRef.current) {
        const textarea = internalRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize]);

    // Merge refs
    const setRefs = (element: HTMLTextAreaElement) => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    return (
      <div className="w-full">
        <textarea
          ref={setRefs}
          className={clsx(
            textareaVariants({
              variant: effectiveVariant,
              textareaSize,
              resize: autoResize ? 'none' : resize,
            }),
            className
          )}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        <div className="flex items-center justify-between mt-1.5">
          {error && <p className="text-sm text-red-400">{error}</p>}
          {showCharCount && maxLength && (
            <p
              className={clsx(
                'text-sm ml-auto',
                charCount > maxLength * 0.9
                  ? 'text-yellow-400'
                  : 'text-slate-500'
              )}
            >
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
