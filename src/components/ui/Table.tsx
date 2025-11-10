import { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

// Table Container
export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hoverable?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, striped = false, hoverable = true, ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto rounded-lg border border-slate-800/60">
        <table
          ref={ref}
          className={clsx(
            'w-full border-collapse text-sm',
            striped && '[&_tbody_tr:nth-child(even)]:bg-slate-900/30',
            hoverable && '[&_tbody_tr]:hover:bg-slate-800/30 [&_tbody_tr]:transition-colors',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = 'Table';

// Table Header
export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return (
    <thead
      ref={ref}
      className={clsx(
        'bg-slate-900/80 border-b border-slate-800/60',
        className
      )}
      {...props}
    />
  );
});

TableHeader.displayName = 'TableHeader';

// Table Body
export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return <tbody ref={ref} className={clsx('', className)} {...props} />;
});

TableBody.displayName = 'TableBody';

// Table Footer
export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return (
    <tfoot
      ref={ref}
      className={clsx(
        'bg-slate-900/80 border-t border-slate-800/60 font-medium',
        className
      )}
      {...props}
    />
  );
});

TableFooter.displayName = 'TableFooter';

// Table Row
export const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => {
  return (
    <tr
      ref={ref}
      className={clsx('border-b border-slate-800/40 last:border-0', className)}
      {...props}
    />
  );
});

TableRow.displayName = 'TableRow';

// Table Head Cell
export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | false;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable = false, sorted = false, children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={clsx(
          'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300',
          sortable && 'cursor-pointer select-none hover:text-slate-100',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortable && sorted && (
            <span className="text-blue-500">
              {sorted === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

// Table Cell
export const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  return (
    <td
      ref={ref}
      className={clsx('px-4 py-3 text-slate-200', className)}
      {...props}
    />
  );
});

TableCell.displayName = 'TableCell';

// Table Caption
export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => {
  return (
    <caption
      ref={ref}
      className={clsx('mt-4 text-sm text-slate-400', className)}
      {...props}
    />
  );
});

TableCaption.displayName = 'TableCaption';
