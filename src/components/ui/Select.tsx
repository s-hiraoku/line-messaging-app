import { SelectHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

const selectVariants = cva(
  'w-full appearance-none rounded-lg border bg-slate-900/50 px-4 py-2 pr-10 text-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'border-slate-700/50 hover:border-slate-600/50 focus:border-blue-500/50 focus:ring-blue-500/50',
        error:
          'border-red-500/50 hover:border-red-400/50 focus:border-red-500 focus:ring-red-500/50',
      },
      selectSize: {
        sm: 'px-3 py-1.5 pr-8 text-sm',
        md: 'px-4 py-2 pr-10 text-base',
        lg: 'px-5 py-3 pr-12 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'md',
    },
  }
);

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  error?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant,
      selectSize,
      error,
      options,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const effectiveVariant = hasError ? 'error' : variant;

    return (
      <div className="w-full">
        <div className="relative">
          <select
            ref={ref}
            className={clsx(
              selectVariants({ variant: effectiveVariant, selectSize }),
              className
            )}
            disabled={disabled}
            {...props}
          >
            {options
              ? options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
