import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "anatomix-fallback-secret-key-321-medical";
export const SESSION_COOKIE_NAME = "anatomix_session";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 hari

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  exp: number; // timestamp ms
}

/**
 * Hash password menggunakan algoritma Scrypt bawaan Node.js
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifikasi password terhadap hash tersimpan
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Buat signed session token (HMAC-SHA256)
 */
export function createSessionToken(user: { id: string; email: string; name: string }): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifikasi session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(payloadB64)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );

    // Cek kedaluwarsa
    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Ambil data user aktif saat ini di server component / Route Handler
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = verifySessionToken(token);
    if (!session) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        institution: true,
        semester: true,
        createdAt: true,
        studyProfile: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
