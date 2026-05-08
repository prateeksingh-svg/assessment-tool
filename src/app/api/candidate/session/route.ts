import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const link = await prisma.assessmentLink.findUnique({
    where: { token },
    select: { id: true, isActive: true, label: true }
  });

  if (!link) return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 404 });

  if (!link.isActive || link.label === "[DELETED]") {
    return NextResponse.json(
      {
        valid: false,
        error: "This assessment link is currently inactive. Please contact the hiring team."
      },
      { status: 403 }
    );
  }

  return NextResponse.json({ valid: true, linkId: link.id });
}
