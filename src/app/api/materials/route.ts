import { NextResponse } from "next/server";
import { getCurrentUser } from "@/../lib/auth";
import { prisma } from "@/../lib/prisma";
import { generateGeminiSummary } from "@/../lib/gemini";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    // Ambil materi milik user aktif, jika belum ada ambil materi demo seeded
    let materials = await prisma.material.findMany({
      where: { userId: user.id },
      include: { summary: true },
      orderBy: { uploadedAt: "desc" },
    });

    if (materials.length === 0) {
      materials = await prisma.material.findMany({
        include: { summary: true },
        orderBy: { uploadedAt: "desc" },
        take: 5,
      });
    }

    const formattedMaterials = materials.map((m) => {
      let subtopics = [];
      let clinicalPoints = [];
      try {
        if (m.summary?.subtopics) {
          subtopics = JSON.parse(m.summary.subtopics);
        }
        if (m.summary?.clinicalPoints) {
          clinicalPoints = JSON.parse(m.summary.clinicalPoints);
        }
      } catch {
        // fallback empty
      }

      return {
        id: m.id,
        title: m.title,
        region: m.system,
        fileName: m.fileName || `${m.title}.pdf`,
        fileSize: m.fileSize || "10.5 MB",
        fileType: m.fileName?.endsWith(".pptx") ? "ppt" : "pdf",
        pageCount: m.pageCount || 20,
        uploadedAt: m.uploadedAt.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        status: m.status,
        processingProgress: m.status === "ready" ? 100 : 50,
        aiSummaryOverview: m.summary?.content || "",
        subtopics,
        clinicalPoints,
      };
    });

    return NextResponse.json({
      success: true,
      materials: formattedMaterials,
    });
  } catch (error) {
    console.error("Get materials error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar materi." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let title = "";
    let region = "Thorax";
    let fileName = "";
    let fileSizeStr = "12.0 MB";
    let fileUrl = "";
    let extractedText = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      title = (formData.get("title") as string) || "";
      region = (formData.get("region") as string) || "Thorax";

      if (!file) {
        return NextResponse.json(
          { success: false, message: "Berkas tidak ditemukan." },
          { status: 400 }
        );
      }

      fileName = file.name;
      fileSizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      if (!title) {
        title = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      }

      // Simpan berkas ke public/uploads/materials
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "materials");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = path.join(uploadsDir, safeName);
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        fileUrl = `/uploads/materials/${safeName}`;
      } catch (saveErr) {
        console.warn("Gagal menyimpan fisik berkas (mungkin di lingkungan serverless):", saveErr);
      }
    } else {
      // JSON body (misal modal tempel teks manual)
      const body = await req.json();
      title = body.title || "Catatan Kuliah Mandiri";
      region = body.region || "Thorax";
      extractedText = body.content || "";
      fileName = `${title.replace(/\s+/g, "_")}.txt`;
      fileSizeStr = "1.2 MB";
    }

    // 1. Buat record Material awal
    const newMaterial = await prisma.material.create({
      data: {
        userId: user.id,
        title,
        system: region,
        fileName,
        fileSize: fileSizeStr,
        fileUrl,
        pageCount: 15,
        status: "processing",
      },
    });

    // 2. Generate Rangkuman AI (Gemini atau Fallback Kurikulum Medis)
    const summaryData = await generateGeminiSummary({
      title,
      region,
      extractedText,
    });

    // 3. Simpan MaterialSummary ke database & ubah status material ke "ready"
    await prisma.materialSummary.create({
      data: {
        materialId: newMaterial.id,
        content: summaryData.overview,
        subtopics: JSON.stringify(summaryData.subtopics),
        clinicalPoints: JSON.stringify(summaryData.clinicalPoints),
      },
    });

    await prisma.material.update({
      where: { id: newMaterial.id },
      data: { status: "ready" },
    });

    return NextResponse.json({
      success: true,
      message: "Materi berhasil diunggah dan dirangkum oleh AI.",
      material: {
        id: newMaterial.id,
        title,
        region,
        fileName,
        fileSize: fileSizeStr,
        status: "ready",
        aiSummaryOverview: summaryData.overview,
        subtopics: summaryData.subtopics,
      },
    });
  } catch (error) {
    console.error("Upload material error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memproses materi kuliah." },
      { status: 500 }
    );
  }
}
