import { NextResponse } from "next/server";
import { getCurrentUser } from "@/../lib/auth";
import { prisma } from "@/../lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { answers = {}, secondsElapsed = 0 } = body;

    const quizIds = Object.keys(answers);
    if (quizIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada jawaban yang dikirim." },
        { status: 400 }
      );
    }

    // Ambil data kunci dari database
    const quizzes = await prisma.quiz.findMany({
      where: { id: { in: quizIds } },
    });

    let correctCount = 0;
    const results = [];

    for (const q of quizzes) {
      const userAnswer = answers[q.id];
      const isCorrect = String(userAnswer).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase();

      if (isCorrect) correctCount++;

      // Simpan log QuizAttempt ke database
      await prisma.quizAttempt.create({
        data: {
          userId: user.id,
          quizId: q.id,
          selectedAnswer: String(userAnswer),
          isCorrect,
          timeSpentSec: Math.round(secondsElapsed / quizzes.length),
        },
      });

      results.push({
        quizId: q.id,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      });
    }

    const score = Math.round((correctCount / quizzes.length) * 100);

    return NextResponse.json({
      success: true,
      score,
      totalQuestions: quizzes.length,
      correctCount,
      wrongCount: quizzes.length - correctCount,
      timeSpentSeconds: secondsElapsed,
      results,
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan hasil kuis." },
      { status: 500 }
    );
  }
}
