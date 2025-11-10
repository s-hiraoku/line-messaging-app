import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function RichMenuLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
