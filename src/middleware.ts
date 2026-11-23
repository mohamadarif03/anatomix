import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "prima_session";

// Daftar rute publik yang tidak memerlukan login
const PUBLIC_PATHS = ["/", "/masuk", "/favicon.ico", "/icon.png", "/apple-icon.png"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan asset statis, Next.js internals, API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/docs") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthPage = pathname === "/masuk";
  const isLandingPage = pathname === "/";

  // 1. Jika sudah ada session cookie dan membuka halaman /masuk, arahkan ke /beranda
  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/beranda", request.url));
  }

  // 2. Jika rute publik (misal Landing Page), izinkan
  if (PUBLIC_PATHS.includes(pathname) || isLandingPage || isAuthPage) {
    return NextResponse.next();
  }

  // 3. Rute privat lainnya (/beranda, /perencana, /materi, /flashcard, /latihan, /kelemahan, /pengaturan, /onboarding)
  // Jika belum login, redirect ke /masuk
  if (!sessionCookie) {
    const loginUrl = new URL("/masuk", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
