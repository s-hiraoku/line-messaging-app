'use client';

import type { ReactNode } from "react";

/**
 * Central place to register client-side providers (Jotai, Query, Theme, etc.).
 * Extend this component as features are implemented.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
