import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    leftIcon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon,
      title,
      description,
      action,
      secondaryAction,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'flex flex-col items-center justify-center py-12 px-4 text-center',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 text-slate-400">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
        )}
        {(action || secondaryAction) && (
          <div className="flex items-center gap-3">
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || 'primary'}
                leftIcon={action.leftIcon}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button onClick={secondaryAction.onClick} variant="ghost">
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
