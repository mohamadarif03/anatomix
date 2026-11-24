import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";
import {
  mockUserProfile,
  mockMaterials,
  mockFlashcards,
  mockQuizQuestions,
  mockThoraxQuizQuestions,
  mockCaputQuizQuestions,
  getStructuresByRegion,
} from "../lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding database PRIMA (SQLite)...");

  // 1. Bersihkan data lama jika ada
  await prisma.flashcardReview.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.materialSummary.deleteMany();
  await prisma.material.deleteMany();
  await prisma.studyTask.deleteMany();
  await prisma.studyPlan.deleteMany();
  await prisma.studyProfile.deleteMany();
  await prisma.anatomyStructure.deleteMany();
  await prisma.user.deleteMany();

  // 2. Buat Pengguna Utama
  const demoUser = await prisma.user.create({
    data: {
      id: "usr-rina-01",
      email: mockUserProfile.email || "rina@fk.ac.id",
      name: mockUserProfile.name || "dr. Rina Safitri (Kandidat)",
      passwordHash: hashPassword("password123"),
      institution: mockUserProfile.institution || "Fakultas Kedokteran ULM",
      semester: mockUserProfile.semester || 3,
    },
  });
  console.log(`✅ User dibuat: ${demoUser.name} (${demoUser.email})`);

  // 2b. Buat Akun Demo Cepat untuk Evaluator / Juri
  const demoEvaluator = await prisma.user.create({
    data: {
      id: "usr-demo-01",
      email: "demo@prima.med.id",
      name: "dr. Rina Safitri (Akun Demo Evaluator)",
      passwordHash: hashPassword("password123"),
      institution: "Fakultas Kedokteran ULM",
      semester: 3,
    },
  });
  await prisma.studyProfile.create({
    data: {
      userId: demoEvaluator.id,
      targetExam: "Ujian Blok Anatomi Regio Caput & Thorax",
      examDate: new Date("2026-12-15"),
      dailyHours: 2.0,
      focusRegions: JSON.stringify(["Caput", "Collum", "Thorax"]),
      learningStyle: "Visual & 3D Interactive",
    },
  });
  console.log(`✅ User demo dibuat: ${demoEvaluator.name} (${demoEvaluator.email})`);

  // 3. Buat StudyProfile & Rencana Belajar
  await prisma.studyProfile.create({
    data: {
      userId: demoUser.id,
      targetExam: mockUserProfile.targetExam || "Ujian Blok Anatomi Kepala & Kranium",
      examDate: new Date(mockUserProfile.examDate || "2026-11-20"),
      dailyHours: 2.0,
      focusRegions: JSON.stringify(["Caput", "Collum", "Thorax"]),
      learningStyle: "Visual & 3D Interactive",
    },
  });

  const plan = await prisma.studyPlan.create({
    data: {
      userId: demoUser.id,
      title: "Rencana Intensif 14 Hari Blok Anatomi",
      targetDate: new Date("2026-11-20"),
      status: "active",
      tasks: {
        create: [
          {
            date: new Date("2026-11-08"),
            dayName: "Senin",
            topic: "Regio Thorax: Morfologi Cor & Cavitas Cordis",
            system: "Kardiovaskuler",
            durationMinutes: 60,
            taskType: "Materi",
            isCompleted: true,
          },
          {
            date: new Date("2026-11-09"),
            dayName: "Selasa",
            topic: "Latihan Soal Vaskularisasi Mediastinum & Jantung",
            system: "Kardiovaskuler",
            durationMinutes: 45,
            taskType: "Latihan",
            isCompleted: true,
          },
          {
            date: new Date("2026-11-10"),
            dayName: "Rabu",
            topic: "Regio Caput: Basis Cranii & Foramina",
            system: "Muskuloskeletal",
            durationMinutes: 60,
            taskType: "Materi",
            isCompleted: false,
          },
          {
            date: new Date("2026-11-11"),
            dayName: "Kamis",
            topic: "Review Flashcard Terminologi Nervus Kranialis",
            system: "Saraf",
            durationMinutes: 30,
            taskType: "Review",
            isCompleted: false,
          },
          {
            date: new Date("2026-11-12"),
            dayName: "Jumat",
            topic: "Regio Abdomen: Truncus Coeliacus & Percabangan",
            system: "Digestif & Vaskuler",
            durationMinutes: 60,
            taskType: "Materi",
            isCompleted: false,
          },
        ],
      },
    },
  });
  console.log(`✅ Rencana Belajar dibuat dengan 5 tasks awal.`);

  // 4. Masukkan Materi & Rangkuman AI
  for (const mat of mockMaterials) {
    const createdMat = await prisma.material.create({
      data: {
        id: mat.id,
        userId: demoUser.id,
        title: mat.title,
        system: mat.region,
        fileName: mat.fileName,
        fileSize: mat.fileSize,
        pageCount: mat.pageCount,
        status: mat.status,
      },
    });

    if (mat.aiSummaryOverview) {
      await prisma.materialSummary.create({
        data: {
          materialId: createdMat.id,
          content: mat.aiSummaryOverview,
          subtopics: JSON.stringify(mat.subtopics || []),
          clinicalPoints: JSON.stringify([
            "Penting memahami hubungan antara Arcus Aortae dengan Nervus Laryngeus Recurrens Sinister.",
            "Oklusi LAD memicu risiko aritmia dan infark miokard anterior yang fatal.",
          ]),
        },
      });
    }
  }
  console.log(`✅ ${mockMaterials.length} Materi Kuliah & Rangkuman AI berhasil disimpan.`);

  // 5. Masukkan Flashcard
  for (const card of mockFlashcards) {
    await prisma.flashcard.create({
      data: {
        id: card.id,
        deckName: card.deckId || "Thorax",
        front: card.front,
        back: card.back,
        latinName: (card as any).latinName || null,
        system: (card as any).system || "Anatomi Umum",
      },
    });
  }
  console.log(`✅ ${mockFlashcards.length} Flashcard berhasil disimpan.`);

  // 6. Masukkan Bank Soal
  // A. Soal Pilihan Ganda (Vignette Klinis dari Materi)
  const { mockMaterialQuizQuestions } = await import("../lib/mock-data");
  let quizCount = 0;

  for (const q of mockMaterialQuizQuestions) {
    await prisma.quiz.create({
      data: {
        id: q.id,
        materialId: q.materialId || "mat-01",
        region: q.region || "Thorax",
        mode: "pilihan-ganda",
        question: q.questionText,
        options: JSON.stringify(q.options),
        correctAnswer: q.correctOptionId,
        explanation: q.explanation || "Pembahasan terverifikasi sesuai silabus anatomi.",
        difficulty: q.difficulty || "sedang",
        isClinicalCase: true,
      },
    });
    quizCount++;
  }

  // B. Soal Kuis 3D Anatomi (Klik Struktur)
  const all3DQuizzes = [
    ...mockQuizQuestions,
    ...mockThoraxQuizQuestions,
    ...mockCaputQuizQuestions,
  ];

  const seen3DQuizIds = new Set<string>();
  for (const q of all3DQuizzes) {
    if (seen3DQuizIds.has(q.id)) continue;
    seen3DQuizIds.add(q.id);

    await prisma.quiz.create({
      data: {
        id: q.id,
        region: "mode" in q && q.mode === "klik-struktur" ? "Thorax" : "Caput",
        mode: "klik-struktur",
        question: (q as any).promptText || (q as any).question || "Temukan struktur berikut:",
        correctAnswer: (q as any).targetStructureId || (q as any).latinName || "struct",
        explanation: q.explanation || "Pembahasan terverifikasi sesuai silabus anatomi.",
        difficulty: "medium",
        isClinicalCase: false,
      },
    });
    quizCount++;
  }
  console.log(`✅ ${quizCount} Butir Soal Ujian (Pilihan Ganda & Kuis 3D) berhasil disimpan.`);

  // 7. Masukkan Master Data Struktur Anatomi 3D (6 Regio Lengkap)
  const regions = ["caput", "collum", "thorax", "abdomen", "pelvis", "membrum"] as const;
  let totalStructures = 0;

  for (const reg of regions) {
    const structs = getStructuresByRegion(reg);
    for (const s of structs) {
      await prisma.anatomyStructure.create({
        data: {
          id: `${reg}-${s.id}`, // pastikan ID unik per regio
          region: reg,
          nameId: (s as any).nameIndo || (s as any).name || "Struktur Anatomi",
          nameLatin: (s as any).nameLatin || (s as any).latinName || "Nomenklatur",
          category: s.category || "Organ",
          description: s.description || "",
          relatedStructures: JSON.stringify((s as any).relatedStructures || []),
        },
      });
      totalStructures++;
    }
  }
  console.log(`✅ ${totalStructures} Struktur Anatomi 3D (6 Regio) berhasil disimpan.`);

  console.log("🎉 Seeding database PRIMA selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
