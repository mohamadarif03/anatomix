import { NextResponse } from "next/server";
import { getCurrentUser } from "@/../lib/auth";
import { prisma } from "@/../lib/prisma";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    const { id } = await props.params;
    const body = await req.json().catch(() => ({}));

    // Cari task yang bersangkutan dan verifikasi milik user aktif
    const existingTask = await prisma.studyTask.findUnique({
      where: { id },
      include: {
        plan: true,
      },
    });

    if (!existingTask || existingTask.plan.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Tugas tidak ditemukan atau bukan milik Anda." },
        { status: 404 }
      );
    }

    const nextCompleted = typeof body.completed === "boolean" ? body.completed : !existingTask.isCompleted;

    const updatedTask = await prisma.studyTask.update({
      where: { id },
      data: {
        isCompleted: nextCompleted,
      },
    });

    return NextResponse.json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status tugas." },
      { status: 500 }
    );
  }
}
