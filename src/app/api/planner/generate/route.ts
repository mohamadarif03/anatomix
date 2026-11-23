import { NextResponse } from "next/server";
import { getCurrentUser } from "@/../lib/auth";
import { prisma } from "@/../lib/prisma";

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const SHORT_DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// Kurikulum anatomi per regio untuk generator adaptif
const REGION_CURRICULUM: Record<string, { topic: string; latin: string; system: string }[]> = {
  thorax: [
    { topic: "Morfologi Cor & Cavitas Cordis", latin: "Cor & Cavitas Cordis", system: "Kardiovaskuler" },
    { topic: "Aparatus Valvularis & Vaskularisasi Koroner", latin: "Valva Cordis & Vasa Coronaria", system: "Kardiovaskuler" },
    { topic: "Mediastinum & Percabangan Arcus Aortae", latin: "Mediastinum & Arcus Aortae", system: "Kardiovaskuler" },
    { topic: "Pulmo, Pleura, & Percabangan Bronchus", latin: "Pulmo, Pleura & Arbor Bronchialis", system: "Respirasi" },
  ],
  caput: [
    { topic: "Basis Cranii & Foramina N. Cranialis", latin: "Basis Cranii & Foramina", system: "Saraf" },
    { topic: "Musculi Faciei & Otot Mastikasi", latin: "Musculi Faciales & Masticatorii", system: "Muskuloskeletal" },
    { topic: "Vaskularisasi Intrakranial & Circulus Willisi", latin: "Circulus Arteriosus Willisi", system: "Kardiovaskuler" },
  ],
  collum: [
    { topic: "Trigonum Colli & Fascia Cervicalis", latin: "Trigonum Cervicale & Fascia", system: "Muskuloskeletal" },
    { topic: "Larynx, Pharynx, & Glandula Thyroidea", latin: "Larynx, Pharynx & Glandula Thyroidea", system: "Respirasi & Endokrin" },
  ],
  abdomen: [
    { topic: "Topografi Peritoneum & Dinding Abdomen", latin: "Peritoneum & Paries Abdominis", system: "Digestif" },
    { topic: "Vaskularisasi Truncus Coeliacus & Mesenterika", latin: "Truncus Coeliacus & A. Mesenterica", system: "Digestif & Vaskuler" },
    { topic: "Hepar, Pancreas, & Sistem Biliaris", latin: "Hepar, Pancreas & Systema Biliare", system: "Digestif" },
  ],
  pelvis: [
    { topic: "Diaphragma Pelvis & Organ Reproduksi", latin: "Diaphragma Pelvis & Organa Genitalia", system: "Urogenital" },
    { topic: "Vaskularisasi Iliaca & Topografi Urogenital", latin: "A. Iliaca Interna & Cavitas Pelvis", system: "Urogenital" },
  ],
  membrum: [
    { topic: "Plexus Brachialis & Inervasi Ekstremitas Superior", latin: "Plexus Brachialis & Nervi", system: "Saraf & Gerak" },
    { topic: "Kompartemen Otot Paha & Plexus Lumbosacralis", latin: "Musculi Femoris & Plexus Lumbalis", system: "Muskuloskeletal" },
  ],
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    // Ambil profil belajar
    const profile = await prisma.studyProfile.findUnique({
      where: { userId: user.id },
    });

    const examDate = profile?.examDate ? new Date(profile.examDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dayDiff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff < 3) dayDiff = 7; // Minimal 7 hari untuk rencana adaptif
    if (dayDiff > 30) dayDiff = 30; // Maksimal 30 hari

    // Parse regio pilihan
    let focusRegions: string[] = ["thorax", "caput", "membrum"];
    try {
      if (profile?.focusRegions) {
        const parsed = JSON.parse(profile.focusRegions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          focusRegions = parsed.map((r: string) => r.toLowerCase().replace("reg-", ""));
        }
      }
    } catch {
      // default fallback
    }

    // Kumpulkan topik yang relevan
    const selectedTopics: { topic: string; latin: string; system: string }[] = [];
    for (const r of focusRegions) {
      if (REGION_CURRICULUM[r]) {
        selectedTopics.push(...REGION_CURRICULUM[r]);
      }
    }
    if (selectedTopics.length === 0) {
      selectedTopics.push(...REGION_CURRICULUM.thorax, ...REGION_CURRICULUM.caput);
    }

    // Arsipkan rencana lama jika ada
    await prisma.studyPlan.updateMany({
      where: { userId: user.id, status: "active" },
      data: { status: "archived" },
    });

    // Buat StudyPlan baru
    const newPlan = await prisma.studyPlan.create({
      data: {
        userId: user.id,
        title: profile?.targetExam || `Rencana Belajar Intensif ${dayDiff} Hari Blok Anatomi`,
        targetDate: examDate,
        status: "active",
      },
    });

    // Buat tasks untuk setiap hari
    const createdTasks = [];
    for (let i = 0; i < dayDiff; i++) {
      const taskDate = new Date(today);
      taskDate.setDate(today.getDate() + i);

      const dayIndex = taskDate.getDay();
      const dayName = DAY_NAMES[dayIndex];
      const topicItem = selectedTopics[i % selectedTopics.length];

      // Setiap hari memiliki 2-3 target spesifik
      const dailyTargets = [
        {
          planId: newPlan.id,
          date: taskDate,
          dayName,
          topic: `Rangkuman AI: ${topicItem.topic}`,
          system: topicItem.system,
          durationMinutes: Math.round(((profile?.dailyHours || 2.0) * 60) * 0.4),
          taskType: "Materi",
          isCompleted: i === 0, // Tugas hari pertama dibuat selesai sebagai contoh
        },
        {
          planId: newPlan.id,
          date: taskDate,
          dayName,
          topic: `Latihan Soal & Vignette Klinis: ${topicItem.latin}`,
          system: topicItem.system,
          durationMinutes: Math.round(((profile?.dailyHours || 2.0) * 60) * 0.35),
          taskType: "Latihan",
          isCompleted: false,
        },
        {
          planId: newPlan.id,
          date: taskDate,
          dayName,
          topic: `Review Flashcard & 3D: ${topicItem.latin}`,
          system: topicItem.system,
          durationMinutes: Math.round(((profile?.dailyHours || 2.0) * 60) * 0.25),
          taskType: "Review",
          isCompleted: false,
        },
      ];

      for (const t of dailyTargets) {
        const task = await prisma.studyTask.create({ data: t });
        createdTasks.push(task);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Rencana belajar ${dayDiff} hari berhasil disusun oleh AI.`,
      plan: newPlan,
      totalTasks: createdTasks.length,
    });
  } catch (error) {
    console.error("Generate planner error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyusun rencana belajar AI." },
      { status: 500 }
    );
  }
}
