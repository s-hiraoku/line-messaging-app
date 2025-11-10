import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    richMenu: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock LINE client
vi.mock("@/lib/line/client", () => {
  const linkRichMenuToUser = vi.fn();
  const unlinkRichMenuFromUser = vi.fn();

  return {
    getLineClient: vi.fn(() => ({
      linkRichMenuToUser,
      unlinkRichMenuFromUser,
    })),
    __mocks: {
      linkRichMenuToUser,
      unlinkRichMenuFromUser,
    },
  };
});

import { POST, DELETE } from "./route";
import { prisma } from "@/lib/prisma";
import * as lineClient from "@/lib/line/client";

const mockFindUniqueRichMenu = prisma.richMenu.findUnique as ReturnType<typeof vi.fn>;
const mockFindUniqueUser = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockUpdateUser = prisma.user.update as ReturnType<typeof vi.fn>;
const mockLinkRichMenuToUser = (lineClient as any).__mocks.linkRichMenuToUser;
const mockUnlinkRichMenuFromUser = (lineClient as any).__mocks.unlinkRichMenuFromUser;

describe("POST /api/line/richmenu/[id]/users/[userId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should link rich menu to user", async () => {
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

    const mockUser = {
      id: "user-1",
      lineUserId: "U1234567890",
      displayName: "Test User",
      richMenuId: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    };

    mockFindUniqueRichMenu.mockResolvedValue(mockMenu);
    mockFindUniqueUser.mockResolvedValue(mockUser);
    mockLinkRichMenuToUser.mockResolvedValue(undefined);
    mockUpdateUser.mockResolvedValue({ ...mockUser, richMenuId: "richmenu-123" });

    const request = new Request(
      "http://localhost:3000/api/line/richmenu/menu-1/users/user-1",
      {
        method: "POST",
      }
    );

    const context = {
      params: Promise.resolve({ id: "menu-1", userId: "user-1" }),
    };

    const response = await POST(request as any, context as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("ユーザーにリッチメニューを設定しました");
    expect(mockLinkRichMenuToUser).toHaveBeenCalledWith("U1234567890", "richmenu-123");
    expect(mockUpdateUser).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { richMenuId: "richmenu-123" },
    });
  });

  it("should return 404 if rich menu not found", async () => {
    mockFindUniqueRichMenu.mockResolvedValue(null);

    const request = new Request(
      "http://localhost:3000/api/line/richmenu/menu-1/users/user-1",
      {
        method: "POST",
      }
    );

    const context = {
      params: Promise.resolve({ id: "menu-1", userId: "user-1" }),
    };

    const response = await POST(request as any, context as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("リッチメニューが見つかりません");
  });

  it("should return 404 if user not found", async () => {
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

    mockFindUniqueRichMenu.mockResolvedValue(mockMenu);
    mockFindUniqueUser.mockResolvedValue(null);

    const request = new Request(
      "http://localhost:3000/api/line/richmenu/menu-1/users/user-1",
      {
        method: "POST",
      }
    );

    const context = {
      params: Promise.resolve({ id: "menu-1", userId: "user-1" }),
    };

    const response = await POST(request as any, context as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("ユーザーが見つかりません");
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

    mockFindUniqueRichMenu.mockResolvedValue(mockMenu);

    const request = new Request(
      "http://localhost:3000/api/line/richmenu/menu-1/users/user-1",
      {
        method: "POST",
      }
    );

    const context = {
      params: Promise.resolve({ id: "menu-1", userId: "user-1" }),
    };

    const response = await POST(request as any, context as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("LINE上にまだアップロードされていません");
  });
});

describe("DELETE /api/line/richmenu/[id]/users/[userId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should unlink rich menu from user", async () => {
    const mockUser = {
      id: "user-1",
      lineUserId: "U1234567890",
      displayName: "Test User",
      richMenuId: "richmenu-123",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    };

    mockFindUniqueUser.mockResolvedValue(mockUser);
    mockUnlinkRichMenuFromUser.mockResolvedValue(undefined);
    mockUpdateUser.mockResolvedValue({ ...mockUser, richMenuId: null });

    const request = new Request(
      "http://localhost:3000/api/line/richmenu/menu-1/users/user-1",
      {
        method: "DELETE",
      }
    );

    const context = {
      params: Promise.resolve({ id: "menu-1", userId: "user-1" }),
    };

    const response = await DELETE(request as any, context as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("ユーザーのリッチメニュー設定を解除しました");
    expect(mockUnlinkRichMenuFromUser).toHaveBeenCalledWith("U1234567890");
    expect(mockUpdateUser).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { richMenuId: null },
    });
  });

  it("should return 404 if user not found", async () => {
    mockFindUniqueUser.mockResolvedValue(null);

    const request = new Request(
      "http://localhost:3000/api/line/richmenu/menu-1/users/user-1",
      {
        method: "DELETE",
      }
    );

    const context = {
      params: Promise.resolve({ id: "menu-1", userId: "user-1" }),
    };

    const response = await DELETE(request as any, context as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("ユーザーが見つかりません");
  });
});
