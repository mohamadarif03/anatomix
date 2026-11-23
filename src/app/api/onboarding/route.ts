import { NextResponse } from "next/server";
import { getCurrentUser } from "@/../lib/auth";
import { prisma } from "@/../lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      selectedRegions = [],
      examName = "Ujian Blok Anatomi",
      examDate,
      dailyHours = 2.0,
      studyDays = [],
      preferences = [],
    } = body;

    const parsedExamDate = examDate ? new Date(examDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const studyProfile = await prisma.studyProfile.upsert({
      where: { userId: user.id },
      update: {
        targetExam: examName,
        examDate: parsedExamDate,
        dailyHours: Number(dailyHours),
        focusRegions: JSON.stringify(selectedRegions),
        learningStyle: Array.isArray(preferences) ? preferences.join(", ") : "visual",
      },
      create: {
        userId: user.id,
        targetExam: examName,
        examDate: parsedExamDate,
        dailyHours: Number(dailyHours),
        focusRegions: JSON.stringify(selectedRegions),
        learningStyle: Array.isArray(preferences) ? preferences.join(", ") : "visual",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil belajar berhasil disimpan.",
      profile: studyProfile,
    });
  } catch (error) {
    console.error("Onboarding API error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menyimpan preferensi belajar." },
      { status: 500 }
    );
  }
}
