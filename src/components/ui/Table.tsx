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
      <div className="w-full overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <table
          ref={ref}
          className={clsx(
            'w-full border-collapse text-sm',
            striped && '[&_tbody_tr:nth-child(even)]:bg-[#FFFEF5]',
            hoverable && '[&_tbody_tr]:hover:bg-[#FFFEF5] [&_tbody_tr]:transition-colors',
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
        'bg-white border-b-2 border-black',
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
        'bg-white border-t-2 border-black font-bold',
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
      className={clsx('border-b-2 border-black last:border-0', className)}
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
          'px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black',
          sortable && 'cursor-pointer select-none hover:bg-[#FFFEF5]',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortable && sorted && (
            <span className="text-[#00B900]">
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
      className={clsx('px-4 py-3 text-black', className)}
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
      className={clsx('mt-4 text-sm text-black/60', className)}
      {...props}
    />
  );
});

TableCaption.displayName = 'TableCaption';
