"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { mockUserProfile } from "@/lib/mock-data";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-[60px] bg-white border-b border-[#e5e7eb] flex items-center justify-between px-3 sm:px-4 sticky top-0 z-30 select-none">
      {/* Left: Brand & Hamburger */}
      <div className="flex items-center">
        <div className="flex items-center gap-2 sm:gap-4 md:w-[214px] md:justify-between pr-2 sm:pr-3">
          <Link href="/beranda" className="flex items-center no-underline group py-1">
            <Image
              src="/logo-horizontal.png"
              alt="ANATOMIX"
              width={140}
              height={44}
              className="h-[32px] sm:h-[38px] w-auto object-contain group-hover:opacity-90 transition-opacity"
              priority
            />
          </Link>
          <button
            onClick={onToggleSidebar}
            className="text-[#475569] hover:text-[#0f172a] p-1.5 rounded-lg hover:bg-slate-100 transition"
            aria-label="Toggle Sidebar"
          >
            <i className="bi bi-list text-[20px]"></i>
          </button>
        </div>
      </div>

      {/* Center: Search Input (Desktop) */}
      <div className="hidden md:flex items-center flex-1 max-w-[385px] mx-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Cari materi anatomi... (Ctrl+K)"
            className="w-full h-[36px] bg-[#f1f5f9] text-[13px] text-[#334155] placeholder-[#64748b] pl-3.5 pr-9 rounded-[6px] focus:outline-none focus:ring-1 focus:ring-[#cbd5e1]"
          />
          <i className="bi bi-search absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] text-[14px]"></i>
        </div>
      </div>

      {/* Right: Icons & Profile */}
      <div className="flex items-center gap-2 sm:gap-4 pr-1">
        {/* Streak Flame Badge */}
        <Link
          href="/kelemahan"
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold hover:bg-amber-100 transition"
          title="5 Hari Beruntun Konsisten"
        >
          <span>🔥</span>
          <span className="hidden sm:inline">5 Hari</span>
        </Link>

        {/* Sun Icon (Desktop only) */}
        <button
          className="hidden sm:flex text-[#334155] hover:text-[#0f172a] items-center justify-center p-1"
          title="Toggle Theme"
        >
          <i className="bi bi-sun-fill text-[15px]"></i>
        </button>

        {/* Fullscreen Icon (Desktop only) */}
        <button
          className="hidden sm:flex text-[#334155] hover:text-[#0f172a] items-center justify-center p-1"
          title="Fullscreen"
        >
          <i className="bi bi-arrows-fullscreen text-[13.5px]"></i>
        </button>

        {/* Notification Bell with Badge 3 */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="relative text-[#334155] hover:text-[#0f172a] flex items-center justify-center p-1"
            title="Notifikasi Belajar"
          >
            <i className="bi bi-bell text-[16px]"></i>
            <span className="absolute -top-1 -right-1 bg-[#dc2626] text-white text-[9.5px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center leading-none border-2 border-white">
              3
            </span>
          </button>

          {/* Notification Dropdown */}
          {showNotification && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowNotification(false)}
              />
              <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white border border-[#e2e8f0] rounded-[8px] shadow-lg z-40 p-3 text-xs">
                <div className="font-bold text-[#1e293b] pb-2 border-b border-[#f1f5f9] flex justify-between items-center">
                  <span>Notifikasi Belajar</span>
                  <span className="badge-completed">3 Baru</span>
                </div>
                <div className="divide-y divide-[#f1f5f9] mt-1">
                  <div className="py-2">
                    <p className="font-semibold text-[#1e293b]">12 Item Jatuh Tempo</p>
                    <p className="text-[#64748b] text-[11px]">Plexus brachialis perlu repetisi hari ini.</p>
                  </div>
                  <div className="py-2">
                    <p className="font-semibold text-[#1e293b]">Streak Belajar Terjaga</p>
                    <p className="text-[#64748b] text-[11px]">5 hari berturut-turut aktif berlatih.</p>
                  </div>
                  <div className="py-2">
                    <p className="font-semibold text-[#1e293b]">Materi AI Baru</p>
                    <p className="text-[#64748b] text-[11px]">Vaskularisasi Koroner siap dipelajari.</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#f1f5f9] text-center">
                  <Link
                    href="/latihan-materials"
                    onClick={() => setShowNotification(false)}
                    className="text-[#0d6efd] font-semibold hover:underline"
                  >
                    Mulai Sesi Review Hari Ini →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="h-[20px] w-[1px] bg-[#e2e8f0] mx-0.5"></div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 text-left hover:bg-slate-50 p-1 sm:p-1.5 rounded-lg transition"
            aria-label="Menu Pengguna"
            aria-expanded={showUserMenu}
          >
            <div className="w-[28px] h-[28px] rounded-full bg-[#0d6efd] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {mockUserProfile.name.charAt(0)}
            </div>
            <span className="text-[13px] font-semibold text-[#1e293b] hidden sm:inline-block">
              {mockUserProfile.name}
            </span>
            <i className={`bi bi-chevron-down text-[11px] text-[#64748b] ml-0.5 transition-transform ${showUserMenu ? "rotate-180" : ""}`}></i>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e2e8f0] rounded-[8px] shadow-lg z-40 p-2 text-xs">
                <div className="px-3 py-2 border-b border-[#f1f5f9]">
                  <p className="font-bold text-[#1e293b]">{mockUserProfile.name}</p>
                  <p className="text-[#64748b] text-[11px] truncate">{mockUserProfile.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-[#0d6efd] border border-blue-100">
                    Semester {mockUserProfile.semester} • Preklinik
                  </span>
                </div>
                <div className="py-1">
                  <Link
                    href="/pengaturan"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc] rounded text-[12px] transition"
                  >
                    <i className="bi bi-gear text-slate-400"></i>
                    <span>Pengaturan Akun</span>
                  </Link>
                  <Link
                    href="/onboarding"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc] rounded text-[12px] transition"
                  >
                    <i className="bi bi-magic text-slate-400"></i>
                    <span>Ulangi Onboarding</span>
                  </Link>
                </div>
                <div className="pt-1 border-t border-[#f1f5f9]">
                  <Link
                    href="/masuk"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded text-[12px] font-medium transition"
                  >
                    <i className="bi bi-box-arrow-right text-rose-500"></i>
                    <span>Keluar (ke Halaman Masuk)</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
