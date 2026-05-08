import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuestionOrder } from "@/lib/scoring";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  mobile: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number.")
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { token, fullName, email, mobile } = parsed.data;

    // Validate token
    const link = await prisma.assessmentLink.findUnique({ where: { token } });
    if (!link) return NextResponse.json({ error: "Invalid assessment link." }, { status: 404 });
    if (!link.isActive || link.label === "[DELETED]") {
      return NextResponse.json(
        { error: "This assessment link is currently inactive. Please contact the hiring team." },
        { status: 403 }
      );
    }

    // Check duplicate
    const existing = await prisma.candidate.findUnique({
      where: { email_linkId: { email, linkId: link.id } }
    });
    if (existing) {
      return NextResponse.json(
        { error: "You have already completed this assessment. Re-attempts are not permitted." },
        { status: 409 }
      );
    }

    // Create candidate + session atomically
    const questionOrder = generateQuestionOrder();

    const candidate = await prisma.candidate.create({
      data: {
        fullName,
        email,
        mobile,
        linkId: link.id,
        session: {
          create: {
            startedAt: new Date(),
            questionOrder,
            tabSwitchCount: 0,
            isCompleted: false
          }
        },
        scores: {
          create: {
            intentScore: 0,
            englishScore: 0,
            salesScore: 0,
            personalityScore: 0,
            aptitudeScore: 0,
            overallScore: 0,
            status: "pending"
          }
        }
      },
      include: { session: true }
    });

    return NextResponse.json({
      candidateId: candidate.id,
      sessionId: candidate.session?.id,
      questionOrder
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
