import type { ReactNode } from "react";

import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import Home from "./page";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Home page", () => {
  it("renders a primary hero heading and dashboard CTA", () => {
    const { getByRole } = render(<Home />);
    // Hero heading (level 1)
    const heroHeading = getByRole("heading", { level: 1 });
    expect(heroHeading).toBeInTheDocument();
    // Dashboard CTA link
    expect(getByRole("link", { name: "ダッシュボードへ進む" })).toHaveAttribute(
      "href",
      "/dashboard"
    );
  });
});
