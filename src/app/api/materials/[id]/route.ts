import { NextResponse } from "next/server";
import { getCurrentUser } from "@/../lib/auth";
import { prisma } from "@/../lib/prisma";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    const material = await prisma.material.findUnique({
      where: { id },
      include: { summary: true },
    });

    if (!material) {
      return NextResponse.json(
        { success: false, message: "Materi tidak ditemukan." },
        { status: 404 }
      );
    }

    let subtopics = [];
    let clinicalPoints = [];
    try {
      if (material.summary?.subtopics) {
        subtopics = JSON.parse(material.summary.subtopics);
      }
      if (material.summary?.clinicalPoints) {
        clinicalPoints = JSON.parse(material.summary.clinicalPoints);
      }
    } catch {
      // fallback
    }

    return NextResponse.json({
      success: true,
      material: {
        id: material.id,
        title: material.title,
        region: material.system,
        fileName: material.fileName || `${material.title}.pdf`,
        fileSize: material.fileSize || "14.2 MB",
        fileType: material.fileName?.endsWith(".pptx") ? "ppt" : "pdf",
        pageCount: material.pageCount || 38,
        uploadedAt: material.uploadedAt.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        status: material.status,
        processingProgress: 100,
        aiSummaryOverview: material.summary?.content || "",
        subtopics,
        clinicalPoints,
      },
    });
  } catch (error) {
    console.error("Get material detail error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data materi." },
      { status: 500 }
    );
  }
}

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
    const body = await req.json();
    const { title, region } = body;

    const updated = await prisma.material.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(region ? { system: region } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Materi berhasil diperbarui.",
      material: updated,
    });
  } catch (error) {
    console.error("Update material error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui materi." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Hapus material dan summary secara cascade
    await prisma.materialSummary.deleteMany({ where: { materialId: id } });
    await prisma.material.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Materi berhasil dihapus.",
    });
  } catch (error) {
    console.error("Delete material error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus materi." },
      { status: 500 }
    );
  }
}
