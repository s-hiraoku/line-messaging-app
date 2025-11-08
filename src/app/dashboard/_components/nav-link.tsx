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
        'group relative flex flex-col gap-1 rounded-xl border border-transparent px-4 py-3 transition',
        'hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-white',
        isActive
          ? 'border-blue-500/60 bg-blue-500/10 text-white shadow-[0_0_30px_-15px_rgba(59,130,246,0.8)]'
          : 'text-slate-300'
      )}
    >
      <div className="flex items-center gap-3 text-sm font-semibold">
        {icon && <span className="text-slate-400 transition group-hover:text-blue-200">{icon}</span>}
        <span>{label}</span>
      </div>
      {description && <span className="text-xs text-slate-400 transition group-hover:text-slate-200">{description}</span>}
    </Link>
  );
}
