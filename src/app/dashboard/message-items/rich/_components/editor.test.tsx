import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RichMessageEditor, type ImagemapArea } from "./editor";

describe("RichMessageEditor", () => {
  const mockAreas: ImagemapArea[] = [
    {
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      action: {
        type: "uri",
        linkUri: "https://example.com",
      },
    },
  ];

  it("renders the editor with image URL", () => {
    const mockOnAreasChange = vi.fn();
    render(
      <RichMessageEditor
        imageUrl="https://example.com/image.jpg"
        areas={mockAreas}
        onAreasChange={mockOnAreasChange}
      />
    );

    expect(screen.getByText("タップ領域")).toBeInTheDocument();
    expect(
      screen.getByText("画像上をドラッグして領域を作成、クリックして選択")
    ).toBeInTheDocument();
  });

  it("renders the editor without image URL", () => {
    const mockOnAreasChange = vi.fn();
    render(
      <RichMessageEditor
        imageUrl=""
        areas={[]}
        onAreasChange={mockOnAreasChange}
      />
    );

    expect(screen.getByText("タップ領域")).toBeInTheDocument();
    expect(
      screen.getByText("画像をアップロードしてください")
    ).toBeInTheDocument();
  });

  it("renders empty state when no areas", () => {
    const mockOnAreasChange = vi.fn();
    render(
      <RichMessageEditor
        imageUrl="https://example.com/image.jpg"
        areas={[]}
        onAreasChange={mockOnAreasChange}
      />
    );

    expect(
      screen.getByText("画像上をドラッグしてタップ領域を作成")
    ).toBeInTheDocument();
  });

  it("renders areas list when areas exist", () => {
    const mockOnAreasChange = vi.fn();
    render(
      <RichMessageEditor
        imageUrl="https://example.com/image.jpg"
        areas={mockAreas}
        onAreasChange={mockOnAreasChange}
      />
    );

    expect(screen.getByText("エリア 1")).toBeInTheDocument();
    expect(screen.getByText("(100, 100) - 200×200")).toBeInTheDocument();
  });
});
