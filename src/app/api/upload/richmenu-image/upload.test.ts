import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock cloudinary
const mockUpload = vi.fn();
vi.mock("@/lib/cloudinary/client", () => ({
  cloudinary: {
    uploader: {
      upload_stream: vi.fn((options, callback) => {
        const stream = {
          end: (buffer: Buffer) => {
            mockUpload(buffer, options);
            callback(null, {
              secure_url: "https://res.cloudinary.com/test/image/upload/v1/richmenu/test.jpg",
              public_id: "richmenu/test",
              width: 2500,
              height: 1686,
            });
          },
        };
        return stream;
      }),
    },
  },
}));

// Mock sharp
const mockMetadata = vi.fn();
vi.mock("sharp", () => {
  return {
    default: vi.fn((buffer: Buffer) => ({
      metadata: mockMetadata,
    })),
  };
});

describe("POST /api/upload/richmenu-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should upload a valid full-size rich menu image", async () => {
    // Create a mock image buffer
    const imageBuffer = Buffer.from("fake-image-data");
    const file = new File([imageBuffer], "richmenu.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("size", "full");

    mockMetadata.mockResolvedValue({
      width: 2500,
      height: 1686,
      format: "jpeg",
    });

    const request = new Request("http://localhost:3000/api/upload/richmenu-image", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      url: "https://res.cloudinary.com/test/image/upload/v1/richmenu/test.jpg",
      publicId: "richmenu/test",
      width: 2500,
      height: 1686,
    });
    expect(mockUpload).toHaveBeenCalled();
  });

  it("should upload a valid half-size rich menu image", async () => {
    const imageBuffer = Buffer.from("fake-image-data");
    const file = new File([imageBuffer], "richmenu.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("size", "half");

    mockMetadata.mockResolvedValue({
      width: 2500,
      height: 843,
      format: "jpeg",
    });

    const request = new Request("http://localhost:3000/api/upload/richmenu-image", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toBe("https://res.cloudinary.com/test/image/upload/v1/richmenu/test.jpg");
  });

  it("should reject request without file", async () => {
    const formData = new FormData();
    formData.append("size", "full");

    const request = new Request("http://localhost:3000/api/upload/richmenu-image", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("ファイルが必要です");
  });

  it("should reject request without size", async () => {
    const imageBuffer = Buffer.from("fake-image-data");
    const file = new File([imageBuffer], "richmenu.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);

    const request = new Request("http://localhost:3000/api/upload/richmenu-image", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("サイズ指定が必要です (full or half)");
  });

  it("should reject non-image files", async () => {
    const file = new File([Buffer.from("not-an-image")], "file.txt", { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("size", "full");

    mockMetadata.mockRejectedValue(new Error("Input buffer contains unsupported image format"));

    const request = new Request("http://localhost:3000/api/upload/richmenu-image", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("画像ファイルではありません");
  });

  it("should reject images with incorrect dimensions", async () => {
    const imageBuffer = Buffer.from("fake-image-data");
    const file = new File([imageBuffer], "richmenu.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("size", "full");

    mockMetadata.mockResolvedValue({
      width: 1000,
      height: 1000,
      format: "jpeg",
    });

    const request = new Request("http://localhost:3000/api/upload/richmenu-image", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("画像サイズが正しくありません");
    expect(data.error).toContain("2500x1686");
    expect(data.error).toContain("1000x1000");
  });

  it("should reject half-size image with full dimensions", async () => {
    const imageBuffer = Buffer.from("fake-image-data");
    const file = new File([imageBuffer], "richmenu.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("size", "half");

    mockMetadata.mockResolvedValue({
      width: 2500,
      height: 1686,
      format: "jpeg",
    });

    const request = new Request("http://localhost:3000/api/upload/richmenu-image", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("2500x843");
  });
});
