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
        'group relative flex flex-col gap-1.5 border-2 border-black px-4 py-3 font-mono transition-all cursor-pointer',
        isActive
          ? 'bg-[#00B900] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
          : 'bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
      )}
    >
      <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide">
        {icon && (
          <span className={clsx(
            "transition-colors",
            isActive ? "text-white" : "text-black"
          )}>
            {icon}
          </span>
        )}
        <span>{label}</span>
      </div>
      {description && (
        <span className={clsx(
          "text-xs font-normal normal-case tracking-normal",
          isActive ? "text-white/90" : "text-black/60"
        )}>
          {description}
        </span>
      )}
    </Link>
  );
}
