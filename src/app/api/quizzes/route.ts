import { NextResponse } from "next/server";
import { getCurrentUser } from "@/../lib/auth";
import { prisma } from "@/../lib/prisma";
import { generateGeminiQuizQuestions } from "@/../lib/gemini";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const materialId = searchParams.get("materialId");
    const region = searchParams.get("region") || "Thorax";
    const count = parseInt(searchParams.get("count") || "5", 10);

    // 1. Cari soal yang sudah ada di database
    const whereClause: any = { mode: "pilihan-ganda" };
    if (materialId && materialId !== "semua") {
      whereClause.materialId = materialId;
    }

    let existingQuizzes = await prisma.quiz.findMany({
      where: whereClause,
      take: count,
    });

    // 2. Jika soal di DB belum ada atau kurang dari count, generate menggunakan Gemini 2.5 Flash
    if (existingQuizzes.length === 0) {
      let materialTitle = "Kardiovaskuler dan Mediastinum";
      if (materialId && materialId !== "semua") {
        const mat = await prisma.material.findUnique({ where: { id: materialId } });
        if (mat) materialTitle = mat.title;
      }

      console.log(`🤖 Men-generate bank soal baru via Gemini untuk "${materialTitle}"...`);
      const aiQuestions = await generateGeminiQuizQuestions({
        materialTitle,
        region,
        count,
      });

      // Simpan ke Prisma Quiz table
      for (const q of aiQuestions) {
        const created = await prisma.quiz.create({
          data: {
            materialId: materialId && materialId !== "semua" ? materialId : null,
            region,
            mode: "pilihan-ganda",
            question: q.question,
            options: JSON.stringify(
              q.options.map((opt) => {
                const id = opt.charAt(0);
                const text = opt.replace(/^[A-E]\.\s*/, "").trim();
                return { id, text };
              })
            ),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            isClinicalCase: true,
          },
        });
        existingQuizzes.push(created);
      }
    }

    // Format ke interface MaterialQuizQuestion
    const formatted = existingQuizzes.map((q) => {
      let parsedOptions = [];
      try {
        parsedOptions = q.options ? JSON.parse(q.options) : [];
      } catch {
        parsedOptions = [
          { id: "A", text: "Opsi A" },
          { id: "B", text: "Opsi B" },
          { id: "C", text: "Opsi C" },
          { id: "D", text: "Opsi D" },
        ];
      }

      return {
        id: q.id,
        materialId: q.materialId || "mat-01",
        subtopicId: "sub-01",
        subtopicTitle: q.region || "Anatomi",
        region: q.region || "Thorax",
        difficulty: q.difficulty || "sedang",
        questionText: q.question,
        latinTerms: ["Terminologia Anatomica"],
        options: parsedOptions,
        correctOptionId: q.correctAnswer || "A",
        explanation: q.explanation,
      };
    });

    return NextResponse.json({
      success: true,
      questions: formatted,
    });
  } catch (error) {
    console.error("Get quizzes error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat soal kuis." },
      { status: 500 }
    );
  }
}
