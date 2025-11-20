import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import GuidePage from "./page";

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

describe("Guide page", () => {
  it("renders hero heading, toc testids, and usage-focused sections", () => {
    const { getByRole, getByText, getByTestId } = render(<GuidePage />);
    // Hero heading
    expect(getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(getByTestId("guide-main-heading")).toBeInTheDocument();
    expect(getByTestId("guide-toc")).toBeInTheDocument();
    // Core usage sections
    [
      "初期セットアップ",
      "メッセージ送信",
      "自動返信設定",
      "リッチメニュー編集",
      "ImageCropUploader",
      "Toast 通知",
      "トラブルシュート",
      "ベストプラクティス",
      "FAQ",
    ].forEach((title) => {
      expect(getByRole("heading", { name: title })).toBeInTheDocument();
    });
    // Navigation link back to dashboard
    expect(getByText("ダッシュボードへ戻る →")).toHaveAttribute(
      "href",
      "/dashboard"
    );
  });
});
