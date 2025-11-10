import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const cardVariants = cva(
  'rounded-xl border backdrop-blur-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default:
          'bg-slate-900/50 border-slate-800/60 hover:bg-slate-900/70 hover:border-slate-700/60',
        glass:
          'bg-slate-900/30 border-slate-800/40 hover:bg-slate-900/50 hover:border-slate-700/50',
        solid: 'bg-slate-900 border-slate-800',
        outline: 'bg-transparent border-slate-700/50 hover:border-slate-600/50',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hoverable: {
        true: 'cursor-pointer hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hoverable: false,
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hoverable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(cardVariants({ variant, padding, hoverable }), className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// CardHeader Component
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  border?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, border = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'flex items-center justify-between',
          border && 'pb-4 border-b border-slate-800/60',
          className
        )}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

// CardTitle Component
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={clsx(
          'text-lg font-semibold text-slate-100',
          className
        )}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

// CardDescription Component
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={clsx('text-sm text-slate-400', className)}
      {...props}
    />
  );
});

CardDescription.displayName = 'CardDescription';

// CardContent Component
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  border?: boolean;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, border = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'py-4',
          border && 'border-t border-slate-800/60',
          className
        )}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

// CardFooter Component
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  border?: boolean;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, border = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'flex items-center gap-2',
          border && 'pt-4 border-t border-slate-800/60',
          className
        )}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';
