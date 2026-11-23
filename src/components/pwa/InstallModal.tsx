"use client";

import React, { useState } from "react";
import Image from "next/image";

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  canPrompt: boolean;
  onPromptInstall: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  canPrompt,
  onPromptInstall,
}) => {
  const [activeTab, setActiveTab] = useState<"android" | "ios" | "desktop">("android");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-modal-title"
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header dengan Gradien Halus */}
        <div className="bg-gradient-to-r from-[#0d6efd] to-[#1e40af] text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition"
            aria-label="Tutup modal"
          >
            <i className="bi bi-x-lg text-[14px]"></i>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center shrink-0">
              <Image
                src="/icon.png"
                alt="ANATOMIX Icon"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 bg-white/15 px-2 py-0.5 rounded-full inline-block mb-1">
                Progressive Web App (PWA)
              </span>
              <h2 id="pwa-modal-title" className="text-lg font-bold leading-tight">
                Pasang Aplikasi ANATOMIX
              </h2>
            </div>
          </div>
          <p className="text-[12px] text-white/90 mt-2.5 leading-relaxed">
            Belajar mandiri lebih fokus & praktis langsung dari layar perangkat Anda tanpa bilah browser.
          </p>
        </div>

        {/* Keunggulan PWA */}
        <div className="px-5 pt-4 pb-2 grid grid-cols-3 gap-2 text-center border-b border-slate-100 bg-slate-50/50">
          <div className="p-2 bg-white rounded-lg border border-slate-200/60 shadow-2xs">
            <i className="bi bi-lightning-charge text-[#0d6efd] text-base mb-0.5 block"></i>
            <span className="text-[11px] font-semibold text-slate-700 block">Akses 1-Klik</span>
            <span className="text-[9.5px] text-slate-500">Dari homescreen</span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200/60 shadow-2xs">
            <i className="bi bi-aspect-ratio text-[#16a34a] text-base mb-0.5 block"></i>
            <span className="text-[11px] font-semibold text-slate-700 block">Layar Penuh</span>
            <span className="text-[9.5px] text-slate-500">Bebas distraksi</span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200/60 shadow-2xs">
            <i className="bi bi-shield-check text-[#7c3aed] text-base mb-0.5 block"></i>
            <span className="text-[11px] font-semibold text-slate-700 block">Offline Cache</span>
            <span className="text-[9.5px] text-slate-500">Hemat kuota</span>
          </div>
        </div>

        {/* Petunjuk Berdasarkan Platform */}
        <div className="p-5">
          <div className="text-[12.5px] font-semibold text-slate-800 mb-2 flex items-center justify-between">
            <span>Panduan Instalasi:</span>
            {/* Tabs */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => setActiveTab("android")}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  activeTab === "android"
                    ? "bg-white text-[#0d6efd] shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Chrome/Android
              </button>
              <button
                onClick={() => setActiveTab("ios")}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  activeTab === "ios"
                    ? "bg-white text-[#0d6efd] shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                iOS/iPhone
              </button>
              <button
                onClick={() => setActiveTab("desktop")}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  activeTab === "desktop"
                    ? "bg-white text-[#0d6efd] shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Desktop
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-[12px] text-slate-700 space-y-2.5">
            {activeTab === "android" && (
              <>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0d6efd] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Jika tombol <strong>&quot;Install Sekarang&quot;</strong> di bawah aktif, cukup klik tombol tersebut untuk konfirmasi pemasangan.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0d6efd] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Atau ketuk menu titik tiga <strong className="text-slate-800">[⋮]</strong> di kanan atas browser Chrome.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0d6efd] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> atau <strong>&quot;Install Aplikasi&quot;</strong>.
                  </span>
                </div>
              </>
            )}

            {activeTab === "ios" && (
              <>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0d6efd] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Buka situs ANATOMIX menggunakan browser <strong>Safari</strong> di iPhone/iPad.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0d6efd] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Ketuk tombol <strong>Bagikan (Share)</strong> <i className="bi bi-box-arrow-up text-blue-600 font-bold mx-0.5"></i> di bilah bawah layar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0d6efd] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Gulir ke bawah lalu pilih <strong>&quot;Tambah ke Layar Utama&quot;</strong> (Add to Home Screen).
                  </span>
                </div>
              </>
            )}

            {activeTab === "desktop" && (
              <>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0d6efd] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Gunakan browser <strong>Google Chrome</strong> atau <strong>Microsoft Edge</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0d6efd] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Klik ikon <strong>Install Aplikasi</strong> <i className="bi bi-download text-blue-600 font-bold mx-0.5"></i> yang muncul di bilah alamat URL sebelah kanan.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0d6efd] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Pilih <strong>&quot;Install&quot;</strong>. ANATOMIX akan terbuka di jendela tersendiri seperti aplikasi desktop native.
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Tutup
            </button>
            {canPrompt ? (
              <button
                onClick={onPromptInstall}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#0d6efd] hover:bg-[#0b5ed7] rounded-lg transition shadow-sm"
              >
                <i className="bi bi-download"></i>
                <span>Install Sekarang</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#0d6efd] hover:bg-[#0b5ed7] rounded-lg transition shadow-sm"
              >
                <i className="bi bi-check-lg"></i>
                <span>Saya Mengerti</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
