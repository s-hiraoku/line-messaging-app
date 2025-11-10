import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma - must be defined before importing the route
vi.mock("@/lib/prisma", () => ({
  prisma: {
    richMenu: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { GET, POST } from "./route";
import { prisma } from "@/lib/prisma";

const mockRichMenuFindMany = prisma.richMenu.findMany as ReturnType<typeof vi.fn>;
const mockRichMenuCreate = prisma.richMenu.create as ReturnType<typeof vi.fn>;
const mockRichMenuFindUnique = prisma.richMenu.findUnique as ReturnType<typeof vi.fn>;
const mockRichMenuDelete = prisma.richMenu.delete as ReturnType<typeof vi.fn>;

describe("GET /api/line/richmenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return list of rich menus", async () => {
    const mockMenus = [
      {
        id: "menu-1",
        name: "Main Menu",
        size: "full",
        chatBarText: "Menu",
        imageUrl: "https://example.com/image.jpg",
        areas: [],
        selected: true,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      },
    ];

    mockRichMenuFindMany.mockResolvedValue(mockMenus);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.richMenus.length).toBe(1);
    expect(data.richMenus[0].id).toBe("menu-1");
    expect(data.richMenus[0].name).toBe("Main Menu");
    expect(mockRichMenuFindMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
  });

  it("should return empty array when no menus exist", async () => {
    mockRichMenuFindMany.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.richMenus).toEqual([]);
  });
});

describe("POST /api/line/richmenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create rich menu successfully", async () => {
    const richMenuData = {
      name: "New Menu",
      size: "full" as const,
      chatBarText: "Menu",
      imageUrl: "https://example.com/image.jpg",
      areas: [
        {
          bounds: { x: 0, y: 0, width: 833, height: 843 },
          action: { type: "uri" as const, uri: "https://example.com" },
        },
      ],
    };

    const createdMenu = {
      id: "menu-1",
      richMenuId: null,
      ...richMenuData,
      selected: false,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    };

    mockRichMenuCreate.mockResolvedValue(createdMenu);

    const request = new Request("http://localhost/api/line/richmenu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(richMenuData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.richMenu.id).toBe("menu-1");
    expect(data.richMenu.name).toBe("New Menu");
    expect(mockRichMenuCreate).toHaveBeenCalledWith({
      data: {
        name: richMenuData.name,
        size: richMenuData.size,
        chatBarText: richMenuData.chatBarText,
        imageUrl: richMenuData.imageUrl,
        areas: richMenuData.areas,
        selected: false,
      },
    });
  });

  it("should validate required fields", async () => {
    const request = new Request("http://localhost/api/line/richmenu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Menu",
        // Missing required fields
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockRichMenuCreate).not.toHaveBeenCalled();
  });

  it("should validate chatBarText length", async () => {
    const request = new Request("http://localhost/api/line/richmenu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Menu",
        size: "full",
        chatBarText: "This is too long text",
        imageUrl: "https://example.com/image.jpg",
        areas: [],
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockRichMenuCreate).not.toHaveBeenCalled();
  });

  it("should validate areas array is not empty", async () => {
    const request = new Request("http://localhost/api/line/richmenu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Menu",
        size: "full",
        chatBarText: "Menu",
        imageUrl: "https://example.com/image.jpg",
        areas: [],
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockRichMenuCreate).not.toHaveBeenCalled();
  });

  it("should reject empty imageUrl", async () => {
    const richMenuData = {
      name: "New Menu",
      size: "full" as const,
      chatBarText: "Menu",
      imageUrl: "",
      areas: [
        {
          bounds: { x: 0, y: 0, width: 833, height: 843 },
          action: { type: "uri" as const, uri: "https://example.com" },
        },
      ],
    };

    const request = new Request("http://localhost/api/line/richmenu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(richMenuData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockRichMenuCreate).not.toHaveBeenCalled();
  });

  it("should reject missing imageUrl", async () => {
    const richMenuData = {
      name: "New Menu",
      size: "full" as const,
      chatBarText: "Menu",
      // Missing imageUrl
      areas: [
        {
          bounds: { x: 0, y: 0, width: 833, height: 843 },
          action: { type: "uri" as const, uri: "https://example.com" },
        },
      ],
    };

    const request = new Request("http://localhost/api/line/richmenu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(richMenuData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockRichMenuCreate).not.toHaveBeenCalled();
  });
});
