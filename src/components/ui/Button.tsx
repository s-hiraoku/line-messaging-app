import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500',
        secondary:
          'bg-slate-800 text-slate-100 border border-slate-700/50 hover:bg-slate-700 hover:border-slate-600/50 active:bg-slate-600 focus-visible:ring-slate-500',
        danger:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500',
        ghost:
          'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100 active:bg-slate-700/50 focus-visible:ring-slate-500',
        outline:
          'border-2 border-blue-600 text-blue-500 hover:bg-blue-600/10 active:bg-blue-600/20 focus-visible:ring-blue-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
