import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const cardVariants = cva(
  'rounded-2xl transition-all duration-300',
  {
    variants: {
      variant: {
        default:
          'bg-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]',
        glass:
          'bg-white/80 backdrop-blur-sm shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_6px_20px_rgba(0,0,0,0.06)]',
        solid: 'bg-[#e8f5e9] shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_16px_rgba(0,185,0,0.1)]',
        outline: 'bg-transparent shadow-[inset_0_-3px_8px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.06)]',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hoverable: {
        true: 'cursor-pointer hover:-translate-y-1 hover:shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_12px_32px_rgba(0,0,0,0.12)]',
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
          border && 'pb-4 border-b border-gray-200',
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
          'text-lg font-bold uppercase tracking-wider text-gray-800',
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
      className={clsx('text-sm text-gray-500', className)}
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
          border && 'border-t border-gray-200',
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
          border && 'pt-4 border-t border-gray-200',
          className
        )}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';
