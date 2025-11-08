import type { ReactNode } from "react";

import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import Home from "./page";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Home page", () => {
  it("renders dashboard CTA", () => {
    const { getByRole } = render(<Home />);

    expect(
      getByRole("heading", { name: "LINE チャネル運用を加速するモダンダッシュボード" })
    ).toBeInTheDocument();
    expect(getByRole("link", { name: "ダッシュボードへ進む" })).toHaveAttribute("href", "/dashboard");
  });
});
