import { NextResponse } from "next/server";
import { getCurrentUser } from "@/../lib/auth";
import { prisma } from "@/../lib/prisma";

const SHORT_DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    const profile = await prisma.studyProfile.findUnique({
      where: { userId: user.id },
    });

    const activePlan = await prisma.studyPlan.findFirst({
      where: { userId: user.id, status: "active" },
      include: {
        tasks: {
          orderBy: { date: "asc" },
        },
      },
    });

    if (!activePlan || activePlan.tasks.length === 0) {
      return NextResponse.json({
        success: true,
        hasPlan: false,
        onboarding: profile ? {
          examName: profile.targetExam,
          examDate: profile.examDate.toISOString().split("T")[0],
          dailyHours: profile.dailyHours,
          selectedRegionIds: JSON.parse(profile.focusRegions || "[]"),
          studyDays: ["Sen", "Sel", "Rab", "Kam", "Jum"],
        } : null,
        schedule: [],
      });
    }

    // Group tasks per date
    const todayStr = new Date().toISOString().split("T")[0];
    const daysMap = new Map<string, any[]>();

    for (const t of activePlan.tasks) {
      const dStr = t.date.toISOString().split("T")[0];
      if (!daysMap.has(dStr)) {
        daysMap.set(dStr, []);
      }
      daysMap.get(dStr)!.push(t);
    }

    const schedule = [];
    let dayCounter = 1;

    for (const [dateStr, tasks] of daysMap.entries()) {
      const d = new Date(dateStr);
      const dayIndex = d.getDay();
      const shortDay = SHORT_DAYS[dayIndex];
      const dayName = tDayName(dayIndex);
      const formattedDate = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
      const isToday = dateStr === todayStr || dayCounter === 1;

      const targets = tasks.map((t, idx) => {
        let category: "Rangkuman AI" | "Latihan Soal" | "Flashcard" | "Anatomi 3D" = "Rangkuman AI";
        let activityType: "materi" | "soal" | "flashcard" | "3d" = "materi";
        let actionUrl = "/materi";
        let itemCount = 4;

        if (t.taskType === "Latihan") {
          category = "Latihan Soal";
          activityType = "soal";
          actionUrl = "/latihan-materials";
          itemCount = 10;
        } else if (t.taskType === "Review") {
          category = "Flashcard";
          activityType = "flashcard";
          actionUrl = "/flashcard";
          itemCount = 15;
        }

        return {
          id: t.id,
          title: t.topic,
          latinTerm: t.system,
          category,
          activityType,
          durationMinutes: t.durationMinutes,
          actionUrl,
          itemCount,
          completed: t.isCompleted,
        };
      });

      schedule.push({
        id: `day-${String(dayCounter).padStart(2, "0")}`,
        dateStr,
        dayName,
        shortDay,
        formattedDate,
        isToday,
        totalItems: targets.reduce((sum, item) => sum + item.itemCount, 0),
        isHeavyLoad: targets.length > 3,
        targets,
      });

      dayCounter++;
    }

    return NextResponse.json({
      success: true,
      hasPlan: true,
      planTitle: activePlan.title,
      onboarding: profile ? {
        examName: profile.targetExam,
        examDate: profile.examDate.toISOString().split("T")[0],
        dailyHours: profile.dailyHours,
        selectedRegionIds: JSON.parse(profile.focusRegions || "[]"),
        studyDays: ["Sen", "Sel", "Rab", "Kam", "Jum"],
      } : null,
      schedule,
    });
  } catch (error) {
    console.error("Get planner error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil rencana belajar." },
      { status: 500 }
    );
  }
}

function tDayName(idx: number): string {
  const names = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return names[idx] || "Senin";
}
