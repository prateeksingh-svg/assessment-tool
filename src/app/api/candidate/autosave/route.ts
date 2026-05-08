import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateId, responses, tabSwitchCount } = body;

    if (!candidateId) return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });

    // Verify session exists and is not completed
    const session = await prisma.candidateSession.findUnique({
      where: { candidateId }
    });

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.isCompleted) return NextResponse.json({ error: "Already submitted" }, { status: 409 });

    // Upsert all responses
    if (responses && Array.isArray(responses)) {
      await Promise.all(
        responses.map((r: { questionId: string; answer: number }) =>
          prisma.candidateResponse.upsert({
            where: {
              candidateId_questionId: {
                candidateId,
                questionId: r.questionId
              }
            },
            update: { answer: r.answer, updatedAt: new Date() },
            create: {
              candidateId,
              questionId: r.questionId,
              answer: r.answer
            }
          })
        )
      );
    }

    // Update tab switch count and last saved
    await prisma.candidateSession.update({
      where: { candidateId },
      data: {
        tabSwitchCount: tabSwitchCount ?? session.tabSwitchCount,
        lastSavedAt: new Date()
      }
    });

    return NextResponse.json({ saved: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Autosave error:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

// GET - restore progress
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get("candidateId");

  if (!candidateId) return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });

  const session = await prisma.candidateSession.findUnique({
    where: { candidateId }
  });

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.isCompleted) return NextResponse.json({ error: "Already submitted" }, { status: 409 });

  const responses = await prisma.candidateResponse.findMany({
    where: { candidateId }
  });

  return NextResponse.json({
    responses,
    tabSwitchCount: session.tabSwitchCount,
    startedAt: session.startedAt,
    questionOrder: session.questionOrder,
    lastSavedAt: session.lastSavedAt
  });
}
