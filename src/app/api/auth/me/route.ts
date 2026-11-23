import { NextResponse } from "next/server";
import { getCurrentUser } from "@/../lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Belum masuk." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data akun." },
      { status: 500 }
    );
  }
}
