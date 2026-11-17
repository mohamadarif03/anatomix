"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();

  const isBeranda = pathname === "/beranda";
  const isKelemahan = pathname === "/kelemahan";
  const isAnatomi = pathname === "/latihan";
  const isLatihanMateri =
    pathname === "/materi" ||
    pathname.startsWith("/materi/") ||
    pathname === "/latihan-materials" ||
    pathname === "/flashcard" ||
    pathname === "/perencana";
  const isPengaturan = pathname === "/pengaturan";

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto pointer-events-none">
      <nav className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80 px-2 py-1.5 flex items-center justify-around pointer-events-auto">
        {/* Tab 1: Beranda */}
        <Link
          href="/beranda"
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            isBeranda ? "text-[#0d6efd]" : "text-slate-600 hover:text-[#0d6efd]"
          }`}
          title="Beranda"
        >
          <i
            className={`text-[20px] ${
              isBeranda ? "bi bi-house-door-fill" : "bi bi-house-door"
            }`}
          ></i>
          <span className="text-[10px] font-semibold mt-0.5">Beranda</span>
          {isBeranda && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d6efd] mt-0.5"></span>
          )}
        </Link>

        {/* Tab 2: Peta Kelemahan */}
        <Link
          href="/kelemahan"
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            isKelemahan
              ? "text-[#0d6efd]"
              : "text-slate-600 hover:text-[#0d6efd]"
          }`}
          title="Peta Kelemahan"
        >
          <i
            className={`text-[20px] ${
              isKelemahan ? "bi bi-pie-chart-fill" : "bi bi-pie-chart"
            }`}
          ></i>
          <span className="text-[10px] font-semibold mt-0.5">Kelemahan</span>
          {isKelemahan && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d6efd] mt-0.5"></span>
          )}
        </Link>

        {/* Tab 3: Tombol Tengah Menonjol (Anatomi 3D) */}
        <Link
          href="/latihan"
          className={`w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-md transition-transform active:scale-95 ${
            isAnatomi
              ? "bg-[#0b5ed7] ring-3 ring-blue-300 shadow-blue-500/40"
              : "bg-gradient-to-tr from-[#0d6efd] to-[#38bdf8] shadow-blue-500/35 hover:scale-105"
          }`}
          title="Buka Modul 3D Anatomi"
        >
          <i className="bi bi-box-seam text-[22px]"></i>
        </Link>

        {/* Tab 4: Latihan Soal & Materi AI */}
        <Link
          href="/latihan-materials"
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            isLatihanMateri
              ? "text-[#0d6efd]"
              : "text-slate-600 hover:text-[#0d6efd]"
          }`}
          title="Latihan Soal & Materi"
        >
          <i
            className={`text-[20px] ${
              isLatihanMateri ? "bi bi-ui-checks" : "bi bi-ui-checks-grid"
            }`}
          ></i>
          <span className="text-[10px] font-semibold mt-0.5">Latihan</span>
          {isLatihanMateri && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d6efd] mt-0.5"></span>
          )}
        </Link>

        {/* Tab 5: Profil & Pengaturan */}
        <Link
          href="/pengaturan"
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            isPengaturan
              ? "text-[#0d6efd]"
              : "text-slate-600 hover:text-[#0d6efd]"
          }`}
          title="Pengaturan & Profil"
        >
          <i
            className={`text-[20px] ${
              isPengaturan ? "bi bi-person-fill" : "bi bi-person"
            }`}
          ></i>
          <span className="text-[10px] font-semibold mt-0.5">Profil</span>
          {isPengaturan && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d6efd] mt-0.5"></span>
          )}
        </Link>
      </nav>
    </div>
  );
}
