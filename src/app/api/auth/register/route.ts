import { NextResponse } from "next/server";
import { prisma } from "@/../lib/prisma";
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME } from "@/../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // 1. Validasi input
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama lengkap wajib diisi." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email wajib diisi." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Kata sandi minimal 8 karakter." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Periksa apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email ini sudah terdaftar. Silakan masuk." },
        { status: 409 }
      );
    }

    // 3. Buat akun baru di database
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        institution: "Fakultas Kedokteran",
        semester: 1,
        studyProfile: {
          create: {
            targetExam: "Ujian Blok Anatomi",
            examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // default 14 hari ke depan
            dailyHours: 2.0,
            focusRegions: JSON.stringify(["Thorax"]),
            learningStyle: "visual",
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        institution: true,
        semester: true,
        createdAt: true,
      },
    });

    // 4. Terbitkan session token & set HttpOnly cookie
    const token = createSessionToken(newUser);

    const response = NextResponse.json(
      {
        success: true,
        message: "Pendaftaran berhasil.",
        user: newUser,
      },
      { status: 201 }
    );

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
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server saat pendaftaran." },
      { status: 500 }
    );
  }
}
