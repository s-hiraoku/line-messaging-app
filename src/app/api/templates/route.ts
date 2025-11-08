import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.template.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}

const createSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "AUDIO", "FLEX", "TEMPLATE"]).default("TEXT"),
  content: z.any(),
  variables: z.record(z.any()).default({}),
  category: z.string().default("default"),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = createSchema.parse(json);

    const created = await prisma.template.create({ data });
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
