"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { mockUserProfile } from "@/lib/mock-data";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { InstallModal } from "@/components/pwa/InstallModal";

interface SidebarProps {
  desktopOpen: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavMenuItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

const mainNavItems: NavMenuItem[] = [
  {
    name: "Beranda",
    href: "/beranda",
    icon: "bi bi-speedometer2",
  },
  {
    name: "Anatomi 3D",
    href: "/latihan",
    icon: "bi bi-box-seam",
    badge: "3D",
    badgeColor: "bg-[#0d6efd]",
  },
  {
    name: "Rencana Belajar",
    href: "/perencana",
    icon: "bi bi-calendar-event",
  },
  {
    name: "Materi",
    href: "/materi",
    icon: "bi bi-file-earmark-medical",
    badge: "AI",
    badgeColor: "bg-[#0d6efd]",
  },
  {
    name: "Latihan Soal",
    href: "/latihan-materials",
    icon: "bi bi-ui-checks",
    badge: "AI",
    badgeColor: "bg-[#0d6efd]",
  },
  {
    name: "Flashcard",
    href: "/flashcard",
    icon: "bi bi-card-heading",
    badge: "AI",
    badgeColor: "bg-[#16a34a]",
  },
  {
    name: "Peta Kelemahan",
    href: "/kelemahan",
    icon: "bi bi-graph-up",
    badge: "Adaptif",
    badgeColor: "bg-[#cc7a00]",
  },
];

const accountNavItems: NavMenuItem[] = [
  {
    name: "Pengaturan",
    href: "/pengaturan",
    icon: "bi bi-gear",
  },
  {
    name: "Ulangi Onboarding",
    href: "/onboarding",
    icon: "bi bi-magic",
    badge: "Wizard",
    badgeColor: "bg-[#198754]",
  },
  {
    name: "Masuk / Keluar",
    href: "/masuk",
    icon: "bi bi-box-arrow-in-right",
    badge: "Auth",
    badgeColor: "bg-[#475569]",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  desktopOpen,
  mobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { isInstalled, canPrompt, isModalOpen, openModal, closeModal, promptInstall } =
    usePwaInstall();

  const handleInstallClick = () => {
    if (canPrompt) {
      promptInstall();
    } else {
      openModal();
    }
  };

  const sidebarContent = (
    <>
      <nav className="flex flex-col">
        {/* FITUR MEDIS SECTION */}
        <div className="px-6 pt-2 pb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#475569]">
          MENU ANATOMIX
        </div>

        {mainNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/materi" && pathname.startsWith("/materi")) ||
            (item.href === "/latihan-materials" && pathname.startsWith("/latihan-materials")) ||
            (item.href === "/flashcard" && pathname.startsWith("/flashcard"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <i className={`${item.icon} nav-icon`}></i>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`${
                    item.badgeColor || "bg-[#0d6efd]"
                  } text-white text-[10.5px] font-semibold px-2 py-0.5 rounded-full leading-tight`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* AKUN SECTION */}
        <div className="px-6 pt-5 pb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#475569]">
          PENGATURAN
        </div>

        {accountNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <i className={`${item.icon} nav-icon`}></i>
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer: PWA Install Button & Streak */}
      <div className="px-4 pt-3 pb-1 border-t border-[#f1f5f9] space-y-2.5">
        {/* Tombol Install PWA */}
        {isInstalled ? (
          <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-[8px] flex items-center justify-between text-emerald-800">
            <div className="flex items-center gap-2 min-w-0">
              <i className="bi bi-phone-fill text-[15px] text-emerald-600"></i>
              <div className="min-w-0">
                <div className="text-[11.5px] font-bold leading-tight truncate">ANATOMIX Terpasang</div>
                <div className="text-[10px] text-emerald-600 truncate">Mode PWA Aktif</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white shrink-0">
              ✓ PWA
            </span>
          </div>
        ) : (
          <button
            onClick={() => {
              handleInstallClick();
              onCloseMobile();
            }}
            className="w-full p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50/70 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/80 rounded-[8px] flex items-center justify-between text-[#0d6efd] transition-all group shadow-2xs text-left cursor-pointer"
            title="Install ANATOMIX ke Layar Utama (PWA)"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-[#0d6efd] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <i className="bi bi-download text-[12.5px]"></i>
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-bold text-[#1e293b] group-hover:text-[#0d6efd] leading-tight">
                  Install Aplikasi
                </div>
                <div className="text-[10px] text-[#64748b]">
                  Pasang di HP / Laptop
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0 shadow-2xs">
              PWA
            </span>
          </button>
        )}

        {/* Streak Mini Box in Sidebar Footer */}
        <div className="p-3 bg-[#f8f9fa] border border-[#e2e8f0] rounded-[6px] flex items-center gap-3">
          <div className="w-[30px] h-[30px] rounded-[6px] bg-[#fff3cd] border border-[#ffeeba] text-[#856404] flex items-center justify-center font-bold text-[14px]">
            🔥
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-bold text-[#1e293b]">
              {mockUserProfile.streakDays} Hari Beruntun
            </div>
            <div className="text-[10.5px] text-[#64748b] truncate">
              Target ujian 17 hari lagi
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Matches template exactly with zero gap) */}
      <aside
        className={`hidden lg:flex flex-col justify-between bg-white border-r border-[#e5e7eb] select-none pt-3 pb-8 flex-shrink-0 transition-all duration-300 ease-in-out ${
          desktopOpen
            ? "w-[230px] opacity-100"
            : "!w-0 !p-0 !border-0 opacity-0 overflow-hidden"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Smooth animated slide-over with backdrop) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        }`}
      >
        {/* Animated backdrop */}
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onCloseMobile}
        />

        {/* Animated drawer panel */}
        <div
          className={`relative z-10 h-full w-[250px] max-w-[85vw] transform transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <aside className="w-full h-full bg-white border-r border-[#e5e7eb] select-none pt-4 pb-8 flex flex-col justify-between overflow-y-auto shadow-2xl">
            <div className="px-6 pb-3 border-b border-[#f1f5f9] flex items-center justify-between">
              <Link href="/beranda" onClick={onCloseMobile} className="flex items-center gap-2.5 no-underline">
                <Image
                  src="/anatomix-logo.png"
                  alt="Logo ANATOMIX"
                  width={36}
                  height={36}
                  className="h-[32px] w-[32px] object-contain drop-shadow-xs shrink-0"
                />
                <span className="text-[18px] font-black tracking-tight text-[#0f4cd6] leading-none">
                  ANATOMIX
                </span>
              </Link>
              <button
                onClick={onCloseMobile}
                className="text-[#64748b] hover:text-[#0f172a] p-1 rounded"
              >
                <i className="bi bi-x-lg text-[16px]"></i>
              </button>
            </div>
            <div className="flex-1 pt-2 flex flex-col justify-between">
              {sidebarContent}
            </div>
          </aside>
        </div>
      </div>

      {/* PWA Install Guidance & Prompt Modal */}
      <InstallModal
        isOpen={isModalOpen}
        onClose={closeModal}
        canPrompt={canPrompt}
        onPromptInstall={promptInstall}
      />
    </>
  );
};
