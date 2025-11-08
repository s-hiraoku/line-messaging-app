import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

import { GET, POST } from "./route";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    template: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("GET /api/templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return list of templates", async () => {
    const mockTemplates = [
      {
        id: "template-1",
        name: "Welcome Message",
        type: "TEXT",
        content: { text: "Welcome!" },
        variables: {},
        category: "greeting",
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        id: "template-2",
        name: "Follow-up",
        type: "TEXT",
        content: { text: "Thank you!" },
        variables: {},
        category: "default",
        isActive: true,
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02"),
      },
    ];

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.template.findMany).mockResolvedValue(mockTemplates as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(2);
    expect(data.items[0].name).toBe("Welcome Message");
    expect(data.items[1].name).toBe("Follow-up");
    expect(prisma.template.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("POST /api/templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new template", async () => {
    const newTemplate = {
      id: "template-1",
      name: "Test Template",
      type: "TEXT" as const,
      content: { text: "Hello!" },
      variables: {},
      category: "greeting",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.template.create).mockResolvedValue(newTemplate as any);

    const request = new NextRequest("http://localhost:3000/api/templates", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Template",
        content: { text: "Hello!" },
        category: "greeting",
      }),
    });

    const response = await POST(request);

    if (response.status !== 201) {
      const errorData = await response.json();
      console.error("Error response:", errorData);
    }

    expect(response.status).toBe(201);
  });

  it("should use default values when optional fields are omitted", async () => {
    const newTemplate = {
      id: "template-1",
      name: "Simple Template",
      type: "TEXT",
      content: { text: "Hello!" },
      variables: {},
      category: "default",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.template.create).mockResolvedValue(newTemplate as any);

    const request = new NextRequest("http://localhost:3000/api/templates", {
      method: "POST",
      body: JSON.stringify({
        name: "Simple Template",
        content: { text: "Hello!" },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.item.type).toBe("TEXT");
    expect(data.item.category).toBe("default");
    expect(data.item.isActive).toBe(true);
  });

  it("should return 400 for invalid request body", async () => {
    const request = new NextRequest("http://localhost:3000/api/templates", {
      method: "POST",
      body: JSON.stringify({
        name: "",
        content: { text: "Hello!" },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });

  it("should return 400 when name is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/templates", {
      method: "POST",
      body: JSON.stringify({
        content: { text: "Hello!" },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });

  it("should accept different message types", async () => {
    const flexTemplate = {
      id: "template-1",
      name: "Flex Template",
      type: "FLEX",
      content: { type: "bubble", body: {} },
      variables: {},
      category: "default",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.template.create).mockResolvedValue(flexTemplate as any);

    const request = new NextRequest("http://localhost:3000/api/templates", {
      method: "POST",
      body: JSON.stringify({
        name: "Flex Template",
        type: "FLEX",
        content: { type: "bubble", body: {} },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.item.type).toBe("FLEX");
  });
});
