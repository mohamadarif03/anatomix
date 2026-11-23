import { NextResponse } from "next/server";
import { prisma } from "@/../lib/prisma";
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from "@/../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Cari user di database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        studyProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email atau kata sandi tidak cocok." },
        { status: 401 }
      );
    }

    // 3. Verifikasi kata sandi
    const isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Email atau kata sandi tidak cocok." },
        { status: 401 }
      );
    }

    // 4. Terbitkan session token & set HttpOnly cookie
    const token = createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      institution: user.institution,
      semester: user.semester,
      hasCompletedOnboarding: !!user.studyProfile,
    };

    const response = NextResponse.json({
      success: true,
      message: "Berhasil masuk.",
      user: safeUser,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 hari
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server saat verifikasi akun." },
      { status: 500 }
    );
  }
}
