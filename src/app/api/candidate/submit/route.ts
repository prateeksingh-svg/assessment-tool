import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateRawScores, calculateFinalScores } from "@/lib/scoring";
import { recalculateRankings } from "@/lib/ranking";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateId, responses, submissionType, tabSwitchCount } = body;

    if (!candidateId) return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });

    // Verify session
    const session = await prisma.candidateSession.findUnique({
      where: { candidateId }
    });

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.isCompleted) return NextResponse.json({ error: "Already submitted" }, { status: 409 });

    // Verify timer - server-side check (20 minutes = 1200 seconds)
    const startedAt = new Date(session.startedAt);
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
    const timeTaken = Math.min(elapsedSeconds, 1200);

    // Save final responses
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
            update: { answer: r.answer, updatedAt: now },
            create: {
              candidateId,
              questionId: r.questionId,
              answer: r.answer
            }
          })
        )
      );
    }

    // Get all saved responses
    const allResponses = await prisma.candidateResponse.findMany({
      where: { candidateId }
    });

    // Calculate scores
    const raw = calculateRawScores(
      allResponses.map((r) => ({ questionId: r.questionId, answer: r.answer }))
    );
    const scores = calculateFinalScores(raw);

    // Update session as completed
    await prisma.candidateSession.update({
      where: { candidateId },
      data: {
        isCompleted: true,
        submittedAt: now,
        submissionType: submissionType || "manual",
        timeTaken,
        tabSwitchCount: tabSwitchCount ?? session.tabSwitchCount,
        lastSavedAt: now
      }
    });

    // Update scores
    await prisma.candidateScore.update({
      where: { candidateId },
      data: {
        intentScore: scores.intentScore,
        englishScore: scores.englishScore,
        salesScore: scores.salesScore,
        personalityScore: scores.personalityScore,
        aptitudeScore: scores.aptitudeScore,
        overallScore: scores.overallScore,
        status: "pending"
      }
    });

    // Recalculate all rankings globally
    await recalculateRankings();

    return NextResponse.json({
      success: true,
      scores,
      timeTaken,
      submittedAt: now.toISOString()
    });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Submission failed. Please try again." }, { status: 500 });
  }
}
