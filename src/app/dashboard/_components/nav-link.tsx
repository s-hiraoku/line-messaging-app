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
  const isHomePage = href === '/';

  return (
    <Link
      href={href}
      className={clsx(
        'group relative flex flex-col gap-1.5 rounded-2xl px-4 py-3 font-mono transition-all duration-300 cursor-pointer',
        isActive && !isHomePage
          ? 'bg-[#00B900] text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.2),inset_0_3px_8px_rgba(255,255,255,0.3),0_8px_24px_rgba(0,185,0,0.4)]'
          : isActive && isHomePage
          ? 'bg-[#FFE500] text-amber-900 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.1),inset_0_3px_8px_rgba(255,255,255,0.5),0_8px_24px_rgba(255,229,0,0.4)]'
          : 'bg-white text-gray-700 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_8px_20px_rgba(0,0,0,0.1)]'
      )}
    >
      <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide">
        {icon && (
          <span className={clsx(
            "transition-colors",
            isActive && !isHomePage ? "text-white" : isActive && isHomePage ? "text-amber-900" : "text-gray-600"
          )}>
            {icon}
          </span>
        )}
        <span>{label}</span>
      </div>
      {description && (
        <span className={clsx(
          "text-xs font-normal normal-case tracking-normal",
          isActive && !isHomePage ? "text-white/90" : isActive && isHomePage ? "text-amber-900/70" : "text-gray-500"
        )}>
          {description}
        </span>
      )}
    </Link>
  );
}
