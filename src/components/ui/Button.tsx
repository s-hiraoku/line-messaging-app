import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

const buttonVariants = cva(
  'cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[#00B900] text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.2),inset_0_3px_8px_rgba(255,255,255,0.3),0_8px_24px_rgba(0,185,0,0.4)] hover:-translate-y-0.5 hover:shadow-[inset_0_-6px_16px_rgba(0,0,0,0.2),inset_0_3px_8px_rgba(255,255,255,0.3),0_12px_32px_rgba(0,185,0,0.5)] active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,185,0,0.3)]',
        secondary:
          'bg-white text-gray-700 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_8px_20px_rgba(0,0,0,0.12)] active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]',
        danger:
          'bg-red-500 text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.2),inset_0_3px_8px_rgba(255,255,255,0.3),0_8px_24px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 hover:shadow-[inset_0_-6px_16px_rgba(0,0,0,0.2),inset_0_3px_8px_rgba(255,255,255,0.3),0_12px_32px_rgba(239,68,68,0.5)] active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3),0_4px_16px_rgba(239,68,68,0.3)]',
        ghost:
          'text-gray-700 hover:bg-[#e8f5e9] hover:shadow-[inset_0_-2px_8px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,185,0,0.1)] active:bg-white',
        outline:
          'bg-transparent text-gray-700 shadow-[inset_0_-3px_8px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:bg-[#e8f5e9] hover:shadow-[inset_0_-3px_8px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8),0_6px_16px_rgba(0,0,0,0.1)] active:translate-y-0.5 active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.08)]',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
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
