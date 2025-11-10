import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors duration-200',
  {
    variants: {
      variant: {
        default:
          'bg-slate-800/80 text-slate-300 border border-slate-700/50',
        primary:
          'bg-blue-600/20 text-blue-400 border border-blue-500/30',
        success:
          'bg-green-600/20 text-green-400 border border-green-500/30',
        warning:
          'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30',
        danger:
          'bg-red-600/20 text-red-400 border border-red-500/30',
        info:
          'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
      },
      dot: {
        true: 'pl-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      dot: false,
    },
  }
);

const dotVariants = cva('h-2 w-2 rounded-full', {
  variants: {
    variant: {
      default: 'bg-slate-400',
      primary: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      info: 'bg-cyan-500',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(badgeVariants({ variant, size, dot }), className)}
        {...props}
      >
        {dot && (
          <span className={dotVariants({ variant })} aria-hidden="true" />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
