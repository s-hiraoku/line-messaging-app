'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

interface NavLinkProps {
  href: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

export function NavLink({ href, label, description, icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname?.startsWith(href ?? '') ?? false;

  return (
    <Link
      href={href}
      className={clsx(
        'group relative flex flex-col gap-1 rounded-xl border px-4 py-3 transition-all duration-200 cursor-pointer',
        'hover:scale-[1.02] hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-white hover:shadow-lg hover:shadow-blue-500/20',
        'active:scale-[0.98]',
        isActive
          ? 'border-blue-500/60 bg-blue-500/15 text-white shadow-[0_0_30px_-10px_rgba(59,130,246,0.9)]'
          : 'border-slate-800/50 text-slate-300 hover:border-blue-500/40'
      )}
    >
      <div className="flex items-center gap-3 text-sm font-semibold">
        {icon && (
          <span className={clsx(
            "transition-all duration-200",
            isActive ? "text-blue-400" : "text-slate-500 group-hover:text-blue-300"
          )}>
            {icon}
          </span>
        )}
        <span>{label}</span>
      </div>
      {description && (
        <span className={clsx(
          "text-xs transition-all duration-200",
          isActive ? "text-slate-300" : "text-slate-500 group-hover:text-slate-300"
        )}>
          {description}
        </span>
      )}
    </Link>
  );
}
