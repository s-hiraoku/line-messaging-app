import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const cardVariants = cva(
  'border-2 border-black transition-all',
  {
    variants: {
      variant: {
        default:
          'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        glass:
          'bg-white/90 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
        solid: 'bg-[#FFFEF5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        outline: 'bg-transparent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hoverable: {
        true: 'cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
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
          border && 'pb-4 border-b-2 border-black',
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
          'text-lg font-bold uppercase tracking-wider text-black',
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
      className={clsx('text-sm text-black/60', className)}
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
          border && 'border-t-2 border-black',
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
          border && 'pt-4 border-t-2 border-black',
          className
        )}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';
