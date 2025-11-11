import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary/client";
import sharp from "sharp";

type RichMenuSize =
  | "2500x1686"
  | "2500x843"
  | "1200x810"
  | "1200x405"
  | "800x540"
  | "800x270"
  | "full"  // Legacy support
  | "half"; // Legacy support

const RICHMENU_SIZES: Record<RichMenuSize, { width: number; height: number }> = {
  "2500x1686": { width: 2500, height: 1686 },
  "2500x843": { width: 2500, height: 843 },
  "1200x810": { width: 1200, height: 810 },
  "1200x405": { width: 1200, height: 405 },
  "800x540": { width: 800, height: 540 },
  "800x270": { width: 800, height: 270 },
  // Legacy support
  full: { width: 2500, height: 1686 },
  half: { width: 2500, height: 843 },
};

const VALID_SIZES: RichMenuSize[] = [
  "2500x1686",
  "2500x843",
  "1200x810",
  "1200x405",
  "800x540",
  "800x270",
  "full",
  "half",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const size = formData.get("size") as string | null;

    if (!file) {
      return NextResponse.json({ error: "ファイルが必要です" }, { status: 400 });
    }

    if (!size || !VALID_SIZES.includes(size as RichMenuSize)) {
      return NextResponse.json(
        { error: "サイズ指定が必要です (2500x1686, 2500x843, 1200x810, 1200x405, 800x540, 800x270)" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate image format and dimensions
    let metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch (err) {
      return NextResponse.json({ error: "画像ファイルではありません" }, { status: 400 });
    }

    const expectedSize = RICHMENU_SIZES[size as RichMenuSize];
    if (metadata.width !== expectedSize.width || metadata.height !== expectedSize.height) {
      return NextResponse.json(
        {
          error: `画像サイズが正しくありません。期待: ${expectedSize.width}x${expectedSize.height}、実際: ${metadata.width}x${metadata.height}`,
        },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const uploadResponse = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "richmenu",
          resource_type: "image",
          format: "jpg", // LINE requires JPG or PNG
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height,
    });
  } catch (error) {
    console.error("[POST /api/upload/richmenu-image] Upload error:", {
      error,
      url: request.url,
      method: request.method,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}
