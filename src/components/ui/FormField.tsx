import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  leftLabel?: ReactNode;
  rightLabel?: ReactNode;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      className,
      label,
      htmlFor,
      required = false,
      error,
      helperText,
      leftLabel,
      rightLabel,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={clsx('w-full', className)} {...props}>
        {(label || leftLabel || rightLabel) && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {label && (
                <label
                  htmlFor={htmlFor}
                  className="text-sm font-bold uppercase tracking-wider text-black"
                >
                  {label}
                  {required && (
                    <span className="ml-1 text-red-600" aria-label="required">
                      *
                    </span>
                  )}
                </label>
              )}
              {leftLabel && (
                <div className="text-sm text-black/60">{leftLabel}</div>
              )}
            </div>
            {rightLabel && (
              <div className="text-sm text-black/60">{rightLabel}</div>
            )}
          </div>
        )}
        {children}
        {(helperText || error) && (
          <div className="mt-1.5">
            {error ? (
              <p className="text-sm font-medium text-red-600">{error}</p>
            ) : (
              helperText && (
                <p className="text-sm text-black/60">{helperText}</p>
              )
            )}
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// FormGroup - For grouping multiple form fields together
export interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('space-y-4', className)}
        {...props}
      >
        {(title || description) && (
          <div className="pb-2 border-b-2 border-black">
            {title && (
              <h3 className="text-base font-bold uppercase tracking-wider text-black">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-black/60">{description}</p>
            )}
          </div>
        )}
        <div className="space-y-4">{children}</div>
      </div>
    );
  }
);

FormGroup.displayName = 'FormGroup';
