import { InputHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const inputVariants = cva(
  'w-full rounded-lg border bg-slate-900/50 px-4 py-2 text-slate-100 placeholder:text-slate-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'border-slate-700/50 hover:border-slate-600/50 focus:border-blue-500/50 focus:ring-blue-500/50',
        error:
          'border-red-500/50 hover:border-red-400/50 focus:border-red-500 focus:ring-red-500/50',
      },
      inputSize: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      error,
      leftElement,
      rightElement,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const effectiveVariant = hasError ? 'error' : variant;

    if (leftElement || rightElement) {
      return (
        <div className="w-full">
          <div className="relative flex items-center">
            {leftElement && (
              <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
                {leftElement}
              </div>
            )}
            <input
              ref={ref}
              className={clsx(
                inputVariants({ variant: effectiveVariant, inputSize }),
                leftElement && 'pl-10',
                rightElement && 'pr-10',
                className
              )}
              disabled={disabled}
              {...props}
            />
            {rightElement && (
              <div className="absolute right-3 flex items-center pointer-events-none text-slate-400">
                {rightElement}
              </div>
            )}
          </div>
          {error && (
            <p className="mt-1.5 text-sm text-red-400">{error}</p>
          )}
        </div>
      );
    }

    return (
      <div className="w-full">
        <input
          ref={ref}
          className={clsx(
            inputVariants({ variant: effectiveVariant, inputSize }),
            className
          )}
          disabled={disabled}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
