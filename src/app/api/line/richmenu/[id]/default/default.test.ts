import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    richMenu: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

// Mock LINE client
vi.mock("@/lib/line/client", () => {
  const setDefaultRichMenu = vi.fn();
  const cancelDefaultRichMenu = vi.fn();

  return {
    getLineClient: vi.fn(() => ({
      setDefaultRichMenu,
      cancelDefaultRichMenu,
    })),
    __mocks: {
      setDefaultRichMenu,
      cancelDefaultRichMenu,
    },
  };
});

import { POST, DELETE } from "./route";
import { prisma } from "@/lib/prisma";
import * as lineClient from "@/lib/line/client";

const mockFindUnique = prisma.richMenu.findUnique as ReturnType<typeof vi.fn>;
const mockUpdate = prisma.richMenu.update as ReturnType<typeof vi.fn>;
const mockUpdateMany = prisma.richMenu.updateMany as ReturnType<typeof vi.fn>;
const mockSetDefaultRichMenu = (lineClient as any).__mocks.setDefaultRichMenu;
const mockCancelDefaultRichMenu = (lineClient as any).__mocks.cancelDefaultRichMenu;

describe("POST /api/line/richmenu/[id]/default", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should set a rich menu as default", async () => {
    const mockMenu = {
      id: "menu-1",
      richMenuId: "richmenu-123",
      name: "Main Menu",
      size: "full",
      chatBarText: "Menu",
      imageUrl: "https://example.com/image.jpg",
      selected: false,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
      areas: [],
    };

    mockFindUnique.mockResolvedValue(mockMenu);
    mockSetDefaultRichMenu.mockResolvedValue(undefined);
    mockUpdateMany.mockResolvedValue({ count: 0 });
    mockUpdate.mockResolvedValue({ ...mockMenu, selected: true });

    const request = new Request("http://localhost:3000/api/line/richmenu/menu-1/default", {
      method: "POST",
    });

    const context = {
      params: Promise.resolve({ id: "menu-1" }),
    };

    const response = await POST(request as any, context as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("デフォルトメニューに設定しました");
    expect(mockSetDefaultRichMenu).toHaveBeenCalledWith("richmenu-123");
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { selected: true },
      data: { selected: false },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "menu-1" },
      data: { selected: true },
    });
  });

  it("should return 404 if rich menu not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/line/richmenu/menu-1/default", {
      method: "POST",
    });

    const context = {
      params: Promise.resolve({ id: "menu-1" }),
    };

    const response = await POST(request as any, context as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("リッチメニューが見つかりません");
  });

  it("should return 400 if rich menu not uploaded to LINE", async () => {
    const mockMenu = {
      id: "menu-1",
      richMenuId: null,
      name: "Main Menu",
      size: "full",
      chatBarText: "Menu",
      imageUrl: "https://example.com/image.jpg",
      selected: false,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
      areas: [],
    };

    mockFindUnique.mockResolvedValue(mockMenu);

    const request = new Request("http://localhost:3000/api/line/richmenu/menu-1/default", {
      method: "POST",
    });

    const context = {
      params: Promise.resolve({ id: "menu-1" }),
    };

    const response = await POST(request as any, context as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("LINE上にまだアップロードされていません");
  });
});

describe("DELETE /api/line/richmenu/[id]/default", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should cancel default rich menu", async () => {
    const mockMenu = {
      id: "menu-1",
      richMenuId: "richmenu-123",
      name: "Main Menu",
      size: "full",
      chatBarText: "Menu",
      imageUrl: "https://example.com/image.jpg",
      selected: true,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
      areas: [],
    };

    mockFindUnique.mockResolvedValue(mockMenu);
    mockCancelDefaultRichMenu.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue({ ...mockMenu, selected: false });

    const request = new Request("http://localhost:3000/api/line/richmenu/menu-1/default", {
      method: "DELETE",
    });

    const context = {
      params: Promise.resolve({ id: "menu-1" }),
    };

    const response = await DELETE(request as any, context as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("デフォルト設定を解除しました");
    expect(mockCancelDefaultRichMenu).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "menu-1" },
      data: { selected: false },
    });
  });

  it("should return 404 if rich menu not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/line/richmenu/menu-1/default", {
      method: "DELETE",
    });

    const context = {
      params: Promise.resolve({ id: "menu-1" }),
    };

    const response = await DELETE(request as any, context as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("リッチメニューが見つかりません");
  });
});
