import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ActionEditor } from "./action-editor";
import type { CardAction } from "./types";

describe("ActionEditor", () => {
  it("renders with empty actions", () => {
    const onChange = vi.fn();
    render(<ActionEditor actions={[]} onChange={onChange} />);

    expect(
      screen.getByText("アクションが設定されていません。アクションを追加してください。")
    ).toBeInTheDocument();
  });

  it("renders existing actions", () => {
    const actions: CardAction[] = [
      { type: "uri", label: "詳細", uri: "https://example.com" },
      { type: "message", label: "選択", text: "カード1を選択" },
    ];
    const onChange = vi.fn();

    render(<ActionEditor actions={actions} onChange={onChange} />);

    expect(screen.getByText("アクション 1")).toBeInTheDocument();
    expect(screen.getByText("アクション 2")).toBeInTheDocument();
    expect(screen.getByDisplayValue("詳細")).toBeInTheDocument();
    expect(screen.getByDisplayValue("選択")).toBeInTheDocument();
  });

  it("adds new action when button is clicked", () => {
    const onChange = vi.fn();
    render(<ActionEditor actions={[]} onChange={onChange} />);

    const addButton = screen.getByText("アクションを追加");
    fireEvent.click(addButton);

    expect(onChange).toHaveBeenCalledWith([
      {
        type: "uri",
        label: "リンク",
        uri: "https://example.com",
      },
    ]);
  });

  it("disables add button when max actions reached", () => {
    const actions: CardAction[] = [
      { type: "uri", label: "Action 1", uri: "https://example.com/1" },
      { type: "uri", label: "Action 2", uri: "https://example.com/2" },
      { type: "uri", label: "Action 3", uri: "https://example.com/3" },
    ];
    const onChange = vi.fn();

    render(<ActionEditor actions={actions} onChange={onChange} maxActions={3} />);

    const addButton = screen.getByText("アクションを追加");
    expect(addButton).toBeDisabled();
  });

  it("deletes action when delete button is clicked", () => {
    const actions: CardAction[] = [
      { type: "uri", label: "Action 1", uri: "https://example.com/1" },
      { type: "uri", label: "Action 2", uri: "https://example.com/2" },
    ];
    const onChange = vi.fn();

    render(<ActionEditor actions={actions} onChange={onChange} />);

    const deleteButtons = screen.getAllByTitle("削除");
    fireEvent.click(deleteButtons[0]);

    expect(onChange).toHaveBeenCalledWith([
      { type: "uri", label: "Action 2", uri: "https://example.com/2" },
    ]);
  });

  it("updates label when input changes", () => {
    const actions: CardAction[] = [
      { type: "uri", label: "Old Label", uri: "https://example.com" },
    ];
    const onChange = vi.fn();

    render(<ActionEditor actions={actions} onChange={onChange} />);

    const labelInput = screen.getByPlaceholderText("ボタンラベル (最大20文字)");
    fireEvent.change(labelInput, { target: { value: "New Label" } });

    expect(onChange).toHaveBeenCalledWith([
      { type: "uri", label: "New Label", uri: "https://example.com" },
    ]);
  });

  it("validates label max length", () => {
    const actions: CardAction[] = [
      { type: "uri", label: "123456789012345678901", uri: "https://example.com" },
    ];
    const onChange = vi.fn();

    render(<ActionEditor actions={actions} onChange={onChange} />);

    expect(
      screen.getByText("ラベルは20文字以内で入力してください")
    ).toBeInTheDocument();
  });

  it("validates URI action requires HTTPS", () => {
    const actions: CardAction[] = [
      { type: "uri", label: "Link", uri: "http://example.com" },
    ];
    const onChange = vi.fn();

    render(<ActionEditor actions={actions} onChange={onChange} />);

    expect(
      screen.getByText("URLはHTTPSで始まる必要があります")
    ).toBeInTheDocument();
  });

  it("changes action type from URI to Message", () => {
    const actions: CardAction[] = [
      { type: "uri", label: "Link", uri: "https://example.com" },
    ];
    const onChange = vi.fn();

    render(<ActionEditor actions={actions} onChange={onChange} />);

    const select = screen.getByDisplayValue("リンク (URI)");
    fireEvent.change(select, { target: { value: "message" } });

    expect(onChange).toHaveBeenCalledWith([
      {
        type: "message",
        label: "Link",
        text: "",
      },
    ]);
  });

  it("renders postback-specific fields", () => {
    const actions: CardAction[] = [
      {
        type: "postback",
        label: "Buy",
        data: "action=buy&item=123",
        displayText: "購入する",
      },
    ];
    const onChange = vi.fn();

    render(<ActionEditor actions={actions} onChange={onChange} />);

    expect(screen.getByDisplayValue("action=buy&item=123")).toBeInTheDocument();
    expect(screen.getByDisplayValue("購入する")).toBeInTheDocument();
    expect(screen.getByText("表示テキスト (オプション)")).toBeInTheDocument();
  });

  it("displays character count for label", () => {
    const actions: CardAction[] = [
      { type: "uri", label: "Test", uri: "https://example.com" },
    ];
    const onChange = vi.fn();

    render(<ActionEditor actions={actions} onChange={onChange} />);

    expect(screen.getByText("4/20文字")).toBeInTheDocument();
  });

  it("displays action count", () => {
    const actions: CardAction[] = [
      { type: "uri", label: "Action 1", uri: "https://example.com/1" },
      { type: "uri", label: "Action 2", uri: "https://example.com/2" },
    ];
    const onChange = vi.fn();

    render(<ActionEditor actions={actions} onChange={onChange} />);

    expect(screen.getByText("2/3 アクション使用中")).toBeInTheDocument();
  });
});
