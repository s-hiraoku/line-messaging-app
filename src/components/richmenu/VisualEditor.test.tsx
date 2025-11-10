import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VisualEditor } from "./VisualEditor";

describe("VisualEditor", () => {
  const mockOnAreasChange = vi.fn();

  const defaultProps = {
    imageUrl: "https://example.com/richmenu.jpg",
    size: "full" as const,
    areas: [],
    onAreasChange: mockOnAreasChange,
  };

  it("should render empty state when no image URL is provided", () => {
    render(<VisualEditor {...defaultProps} imageUrl="" />);
    expect(
      screen.getByText("画像をアップロードしてタップ領域を設定してください")
    ).toBeInTheDocument();
  });

  it("should render canvas when image URL is provided", () => {
    const { container } = render(<VisualEditor {...defaultProps} />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("should display empty area list when no areas exist", () => {
    render(<VisualEditor {...defaultProps} />);
    expect(screen.getByText("画像上をドラッグしてタップ領域を作成")).toBeInTheDocument();
  });

  it("should display areas when provided", () => {
    const areas = [
      {
        bounds: { x: 0, y: 0, width: 833, height: 843 },
        action: { type: "uri" as const, uri: "https://example.com" },
      },
      {
        bounds: { x: 833, y: 0, width: 833, height: 843 },
        action: { type: "message" as const, text: "Hello" },
      },
    ];

    render(<VisualEditor {...defaultProps} areas={areas} />);
    expect(screen.getByText("エリア 1")).toBeInTheDocument();
    expect(screen.getByText("エリア 2")).toBeInTheDocument();
  });

  it("should render action inputs based on action type", () => {
    const areas = [
      {
        bounds: { x: 0, y: 0, width: 833, height: 843 },
        action: { type: "uri" as const, uri: "https://example.com" },
      },
    ];

    render(<VisualEditor {...defaultProps} areas={areas} />);
    const uriInput = screen.getByPlaceholderText("https://example.com");
    expect(uriInput).toHaveValue("https://example.com");
  });

  it("should call onAreasChange when deleting an area", () => {
    const areas = [
      {
        bounds: { x: 0, y: 0, width: 833, height: 843 },
        action: { type: "uri" as const, uri: "https://example.com" },
      },
      {
        bounds: { x: 833, y: 0, width: 833, height: 843 },
        action: { type: "message" as const, text: "Hello" },
      },
    ];

    render(<VisualEditor {...defaultProps} areas={areas} />);
    const deleteButtons = screen.getAllByTitle("削除");

    fireEvent.click(deleteButtons[0]);

    expect(mockOnAreasChange).toHaveBeenCalledWith([areas[1]]);
  });

  it("should update action when changing action type", () => {
    const areas = [
      {
        bounds: { x: 0, y: 0, width: 833, height: 843 },
        action: { type: "uri" as const, uri: "https://example.com" },
      },
    ];

    render(<VisualEditor {...defaultProps} areas={areas} />);
    const select = screen.getByDisplayValue("リンク (URI)");

    fireEvent.change(select, { target: { value: "message" } });

    expect(mockOnAreasChange).toHaveBeenCalledWith([
      {
        bounds: { x: 0, y: 0, width: 833, height: 843 },
        action: { type: "message", text: "メッセージ" },
      },
    ]);
  });

  it("should update URI value when editing URI input", () => {
    const areas = [
      {
        bounds: { x: 0, y: 0, width: 833, height: 843 },
        action: { type: "uri" as const, uri: "https://example.com" },
      },
    ];

    render(<VisualEditor {...defaultProps} areas={areas} />);
    const uriInput = screen.getByPlaceholderText("https://example.com");

    fireEvent.change(uriInput, { target: { value: "https://newurl.com" } });

    expect(mockOnAreasChange).toHaveBeenCalledWith([
      {
        bounds: { x: 0, y: 0, width: 833, height: 843 },
        action: { type: "uri", uri: "https://newurl.com" },
      },
    ]);
  });

  it("should render color indicators for each area", () => {
    const areas = [
      {
        bounds: { x: 0, y: 0, width: 833, height: 843 },
        action: { type: "uri" as const, uri: "https://example.com" },
      },
    ];

    const { container } = render(<VisualEditor {...defaultProps} areas={areas} />);
    const colorIndicators = container.querySelectorAll(".h-4.w-4.rounded");
    expect(colorIndicators.length).toBe(1);
  });
});
