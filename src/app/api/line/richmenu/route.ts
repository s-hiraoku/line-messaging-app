import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// GET - List all rich menus
export async function GET() {
  try {
    const richMenus = await prisma.richMenu.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ richMenus });
  } catch (error) {
    console.error("Failed to fetch rich menus:", error);
    return NextResponse.json(
      { error: "Failed to fetch rich menus" },
      { status: 500 }
    );
  }
}

// POST - Create new rich menu
const createRichMenuSchema = z.object({
  name: z.string().min(1),
  size: z.enum(["2500x1686", "2500x843", "1200x810", "1200x405", "800x540", "800x270"]),
  chatBarText: z.string().min(1).max(14),
  imageUrl: z.string().url().optional().or(z.literal("")),
  areas: z.array(
    z.object({
      bounds: z.object({
        x: z.number().min(0),
        y: z.number().min(0),
        width: z.number().min(1),
        height: z.number().min(1),
      }),
      action: z.discriminatedUnion("type", [
        z.object({
          type: z.literal("uri"),
          uri: z.string().url(),
        }),
        z.object({
          type: z.literal("message"),
          text: z.string().min(1),
        }),
        z.object({
          type: z.literal("postback"),
          data: z.string().min(1),
          text: z.string().optional(),
        }),
      ]),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = createRichMenuSchema.parse(json);

    // TODO: Create rich menu via LINE API
    // For now, just save to database
    const richMenu = await prisma.richMenu.create({
      data: {
        name: data.name,
        size: data.size,
        chatBarText: data.chatBarText,
        imageUrl: data.imageUrl || null,
        areas: data.areas,
        selected: false,
      },
    });

    return NextResponse.json({ richMenu }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: error.flatten() },
        { status: 400 }
      );
    }

    console.error("Failed to create rich menu:", error);
    return NextResponse.json(
      { error: "Failed to create rich menu" },
      { status: 500 }
    );
  }
}
