import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary/client";
import sharp from "sharp";

const RICHMENU_SIZES = {
  full: { width: 2500, height: 1686 },
  half: { width: 2500, height: 843 },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const size = formData.get("size") as "full" | "half" | null;

    if (!file) {
      return NextResponse.json({ error: "ファイルが必要です" }, { status: 400 });
    }

    if (!size || !["full", "half"].includes(size)) {
      return NextResponse.json({ error: "サイズ指定が必要です (full or half)" }, { status: 400 });
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

    const expectedSize = RICHMENU_SIZES[size];
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
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}
