"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ChartJS from "chart.js/auto";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  mockUserProfile,
  mockDashboardStats,
  mockWeeklyProgress,
  mockAnatomyWeaknesses,
  mockRecommendations,
  mockDailyChecklist,
  DailyChecklistItem,
} from "@/lib/mock-data";

export default function BerandaPage() {
  const [checklist, setChecklist] = useState<DailyChecklistItem[]>(mockDailyChecklist);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const weeklyChartRef = useRef<HTMLCanvasElement | null>(null);
  const distributionChartRef = useRef<HTMLCanvasElement | null>(null);

  // Toggle checklist
  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const completedCount = checklist.filter((i) => i.completed).length;
  const totalCount = checklist.length;
  const checklistPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Chart 1: Progres Latihan Mingguan (Bar Chart)
  useEffect(() => {
    if (!weeklyChartRef.current) return;
    const ctx = weeklyChartRef.current.getContext("2d");
    if (!ctx) return;

    const chartInstance = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: mockWeeklyProgress.map((p) => p.day),
        datasets: [
          {
            label: "Item Dilatih",
            data: mockWeeklyProgress.map((p) => p.itemsReviewed),
            backgroundColor: "#3b76e1",
            borderRadius: {
              topLeft: 4,
              topRight: 4,
              bottomLeft: 0,
              bottomRight: 0,
            },
            borderSkipped: false,
            barPercentage: 0.55,
            categoryPercentage: 0.8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1e293b",
            titleFont: { size: 12, family: "'Inter', sans-serif" },
            bodyFont: { size: 12, family: "'Inter', sans-serif" },
            padding: 8,
            cornerRadius: 4,
            callbacks: {
              label: (context) => ` ${context.parsed.y} item dilatih (Target: 20)`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: "#e2e8f0" },
            ticks: {
              font: { size: 11.5, family: "'Inter', sans-serif" },
              color: "#64748b",
              padding: 6,
            },
          },
          y: {
            min: 0,
            max: 35,
            border: { display: false },
            grid: { color: "#f1f5f9" },
            ticks: {
              stepSize: 10,
              font: { size: 11.5, family: "'Inter', sans-serif" },
              color: "#64748b",
              padding: 8,
            },
          },
        },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, []);

  // Chart 2: Distribusi Retensi Materi (Doughnut Chart)
  useEffect(() => {
    if (!distributionChartRef.current) return;
    const ctx = distributionChartRef.current.getContext("2d");
    if (!ctx) return;

    const chartInstance = new ChartJS(ctx, {
      type: "doughnut",
      data: {
        labels: ["Dikuasai (>80%)", "Cukup Baik (70-80%)", "Perlu Latihan (50-70%)", "Kritis (<50%)"],
        datasets: [
          {
            data: [42, 28, 18, 12],
            backgroundColor: ["#198754", "#087990", "#cc7a00", "#dc2626"],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1e293b",
            titleFont: { size: 12, family: "'Inter', sans-serif" },
            bodyFont: { size: 12, family: "'Inter', sans-serif" },
            padding: 8,
            cornerRadius: 4,
            callbacks: {
              label: (context) => ` ${context.label}: ${context.parsed}%`,
            },
          },
        },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, []);

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-[6px] bg-[#1e293b] px-4 py-3 text-[13px] text-white shadow-lg animate-in fade-in duration-200">
          <i className="bi bi-info-circle text-[#38bdf8]"></i>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#94a3b8] hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* =========================================================================
           1. TAMPILAN MOBILE (< 768px) - KONSEP PERSIS SEPERTI DI index.html
           ========================================================================= */}
      <div className="md:hidden flex flex-col space-y-5 -mx-1">
        {/* HERO BLUE SECTION */}
        <div className="mobile-hero-pattern text-white pt-5 pb-16 px-4 rounded-2xl relative overflow-hidden shadow-sm">
          {/* Faint Background Icons */}
          <i className="bi bi-box-seam text-white/5 text-[110px] absolute -bottom-4 left-2 pointer-events-none"></i>
          <i className="bi bi-graph-up text-white/5 text-[130px] absolute top-6 -right-6 pointer-events-none"></i>
          <i className="bi bi-fire text-white/5 text-[50px] absolute bottom-4 left-1/3 pointer-events-none"></i>

          {/* Top Bar: Streak Trophy, Transparent Search Bar, Bell Icon */}
          <div className="flex items-center justify-between gap-2.5 mb-5 relative z-10">
            <Link
              href="/kelemahan"
              className="text-white hover:opacity-80 transition flex items-center gap-1 p-1"
              title="5 Hari Beruntun"
            >
              <i className="bi bi-trophy-fill text-[19px] text-amber-300"></i>
            </Link>

            <div className="flex-1 relative">
              <i className="bi bi-search text-white/80 absolute left-3 top-1/2 -translate-y-1/2 text-[12px]"></i>
              <input
                type="text"
                placeholder='Cari "Materi Anatomi"'
                className="w-full bg-white/20 text-white placeholder-white/80 rounded-full py-1.5 pl-8 pr-3 text-[12px] focus:outline-none focus:bg-white/30 backdrop-blur-sm border border-white/20"
              />
            </div>

            <button
              onClick={() => showToast("3 Item jatuh tempo perlu repetisi hari ini")}
              className="text-white hover:opacity-80 transition relative p-1"
              title="16 Item Jatuh Tempo"
            >
              <i className="bi bi-bell-fill text-[19px]"></i>
              <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center absolute -top-0.5 -right-0.5 border border-white">
                3
              </span>
            </button>
          </div>

          {/* Info Penguasaan Tengah */}
          <div className="text-center relative z-10 my-1">
            {/* Pill Kandidat Dokter */}
            <div className="inline-flex items-center gap-1.5 text-[11.5px] text-white/95 font-medium mb-1.5 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
              <span>🩺</span>
              <span>
                {mockUserProfile.name} • H-{mockDashboardStats.daysUntilExam} Ujian
              </span>
            </div>

            {/* Angka Utama: Rata-rata Penguasaan */}
            <h1 className="text-4xl font-extrabold tracking-tight mb-1 text-white">
              {mockDashboardStats.masteryPercentage}%
            </h1>
            <p className="text-[12px] text-white/90 font-normal mb-5">
              Rata-Rata Penguasaan •{" "}
              <span className="font-semibold underline">
                {mockDashboardStats.dueTodayCount} Item Hari Ini
              </span>
            </p>

            {/* Tombol Kapsul Utama */}
            <Link
              href="/latihan-materials"
              className="inline-flex items-center gap-2 border border-white/85 hover:bg-white hover:text-[#0d6efd] text-white text-xs font-semibold py-2.5 px-6 rounded-full transition duration-200 shadow-sm bg-white/10 backdrop-blur-xs"
            >
              <i className="bi bi-play-fill text-[15px]"></i>
              <span>Mulai Latihan Soal</span>
            </Link>
          </div>
        </div>

        {/* OVERLAPPING CARD 3 KOLOM */}
        <div className="px-2 -mt-10 relative z-20">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-3.5 px-2 grid grid-cols-3 divide-x divide-slate-100 text-center">
            {/* Aksi 1: Anatomi 3D */}
            <Link
              href="/latihan"
              className="flex flex-col items-center justify-center gap-1.5 group py-1"
            >
              <div className="w-11 h-11 rounded-full bg-[#0d6efd] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                <i className="bi bi-box-seam text-[18px]"></i>
              </div>
              <span className="text-[11.5px] text-slate-700 font-medium">Anatomi 3D</span>
            </Link>

            {/* Aksi 2: Flashcard AI */}
            <Link
              href="/flashcard"
              className="flex flex-col items-center justify-center gap-1.5 group py-1"
            >
              <div className="w-11 h-11 rounded-full bg-[#16a34a] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                <i className="bi bi-card-heading text-[18px]"></i>
              </div>
              <span className="text-[11.5px] text-slate-700 font-medium">Flashcard AI</span>
            </Link>

            {/* Aksi 3: Peta Adaptif / Streak */}
            <Link
              href="/kelemahan"
              className="flex flex-col items-center justify-center gap-1.5 group py-1"
            >
              <div className="w-11 h-11 rounded-full bg-amber-50 text-[#d97706] flex items-center justify-center group-hover:scale-105 transition border border-amber-200/50">
                <i className="bi bi-fire text-[20px] text-amber-500"></i>
              </div>
              <span className="text-[11.5px] text-slate-700 font-medium">{mockDashboardStats.streakDays} Hari Streak</span>
            </Link>
          </div>
        </div>

        {/* DAFTAR DISTRIBUSI & EVALUASI */}
        <div className="mt-2">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <h2 className="text-[16px] font-bold text-slate-800">Distribusi & Evaluasi</h2>
              <p className="text-[11px] text-slate-500">142 item dilatih minggu ini (86% benar)</p>
            </div>
            <Link href="/kelemahan" className="text-slate-500 hover:text-[#0d6efd] transition">
              <i className="bi bi-arrow-right text-[18px]"></i>
            </Link>
          </div>

          {/* List Card Putih (divide-y) */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 px-4 py-1 divide-y divide-slate-100">
            {/* Item 1: Jatuh Tempo / Kritis */}
            <Link href="/latihan-materials" className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                  <i className="bi bi-bell text-[16px]"></i>
                </div>
                <div>
                  <span className="font-semibold text-slate-800 text-[12.5px] block">Jatuh Tempo & Kritis</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">4 item kritis perlu repetisi</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-red-600 text-xs">-{mockDashboardStats.dueTodayCount} Item</span>
                <i className="bi bi-chevron-right text-[12px] text-slate-400"></i>
              </div>
            </Link>

            {/* Item 2: Materi Dikuasai */}
            <Link href="/perencana" className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#15803d] flex items-center justify-center shrink-0 border border-emerald-100">
                  <i className="bi bi-check-circle text-[16px]"></i>
                </div>
                <div>
                  <span className="font-semibold text-slate-800 text-[12.5px] block">Materi Dikuasai</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Target tercapai 5/7 hari</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-[#15803d] text-xs">42%</span>
                <i className="bi bi-chevron-right text-[12px] text-slate-400"></i>
              </div>
            </Link>

            {/* Item 3: Perlu Latihan Ulang */}
            <Link href="/materi" className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <i className="bi bi-graph-down text-[16px]"></i>
                </div>
                <div>
                  <span className="font-semibold text-slate-800 text-[12.5px] block">Perlu Latihan Ulang</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Muskuloskeletal & Koroner</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-amber-600 text-xs">18%</span>
                <i className="bi bi-chevron-right text-[12px] text-slate-400"></i>
              </div>
            </Link>

            {/* Item 4: Hitung Mundur Ujian */}
            <Link href="/perencana" className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                  <i className="bi bi-clock text-[16px]"></i>
                </div>
                <div>
                  <span className="font-semibold text-slate-800 text-[12.5px] block">Ujian Blok Anatomi</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Jadwal: 20 Nov 2026</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-teal-700 text-xs">{mockDashboardStats.daysUntilExam} Hari</span>
                <i className="bi bi-chevron-right text-[12px] text-slate-400"></i>
              </div>
            </Link>
          </div>
        </div>

        {/* AKTIVITAS LATIHAN 7 HARI (GRAFIK BATANG MOBILE) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-[14.5px] text-slate-800">Aktivitas Latihan 7 Hari</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Target: 20 item / hari • 5/7 tercapai</p>
            </div>
            <span className="badge-completed text-[10px]">Aktif</span>
          </div>

          {/* Bar Chart Sederhana Responsif */}
          <div className="relative pt-4 pb-2 border-b border-slate-100">
            <div className="flex items-end justify-between px-2 h-28 gap-1.5">
              {[
                { day: "Sen", val: 18, pct: "52%" },
                { day: "Sel", val: 25, pct: "75%" },
                { day: "Rab", val: 22, pct: "65%" },
                { day: "Kam", val: 30, pct: "90%" },
                { day: "Jum", val: 26, pct: "78%" },
                { day: "Sab", val: 12, pct: "35%" },
                { day: "Min", val: 20, pct: "60%" },
              ].map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div
                    className="w-full max-w-[28px] bg-[#0d6efd] rounded-t-sm transition-all duration-300 group-hover:bg-[#0b5ed7]"
                    style={{ height: item.pct }}
                    title={`${item.day}: ${item.val} item`}
                  ></div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1.5">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-3 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Total Minggu Ini</span>
              <span className="font-bold text-slate-800 text-xs">153 Item</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Rata-rata Harian</span>
              <span className="font-bold text-slate-800 text-xs">21.8 Item</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Akurasi Jawaban</span>
              <span className="font-bold text-[#16a34a] text-xs">86.2%</span>
            </div>
          </div>
        </div>

        {/* TARGET BELAJAR HARI INI (CHECKLIST DI MOBILE) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-[14.5px] text-slate-800">Target Belajar Hari Ini</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{completedCount} dari {checklist.length} item selesai ({checklistPercent}%)</p>
            </div>
            <span className="text-xs font-bold text-[#0d6efd] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {checklistPercent}%
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item.id)}
                className="py-2.5 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleChecklist(item.id)}
                    className="w-4 h-4 text-[#0d6efd] rounded border-slate-300 focus:ring-[#0d6efd] cursor-pointer"
                  />
                  <div className="min-w-0">
                    <span className={`text-[12.5px] block ${item.completed ? "line-through text-slate-400" : "font-medium text-slate-800"}`}>
                      {item.label}
                    </span>
                    {item.latinTerm && (
                      <span className="text-[10.5px] italic text-slate-500 block">
                        {item.latinTerm}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
           2. TAMPILAN DESKTOP (>= 768px) - TETAP SAMA PERSIS SEPERTI SEBELUMNYA
           ========================================================================= */}
      <div className="hidden md:block">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h1 className="text-[21px] font-medium text-[#1e293b] leading-tight">Beranda</h1>
          <p className="text-[12.5px] text-[#64748b] mt-0.5">
            Selamat datang kembali, <span className="font-semibold text-[#1e293b]">{mockUserProfile.name}</span> · Ada{" "}
            <strong className="text-[#0d6efd] font-semibold">{mockDashboardStats.dueTodayCount} item</strong> yang perlu diulang hari ini
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/latihan-materials"
            className="h-[34px] px-3.5 bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-[13px] font-medium rounded-[6px] flex items-center gap-1.5 shadow-sm transition"
          >
            <i className="bi bi-play-fill text-[16px]"></i>
            <span>Mulai Latihan Soal</span>
          </Link>
          <Link
            href="/latihan"
            className="h-[34px] px-3 bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] text-[#475569] text-[13px] font-medium rounded-[6px] flex items-center gap-1.5 transition"
            title="Buka Modul 3D"
          >
            <i className="bi bi-box-seam text-[13.5px]"></i>
            <span className="hidden sm:inline">Modul 3D</span>
          </Link>
        </div>
      </div>

      {/* ROW 1: 4 KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-5">
        {/* Card 1: ITEM JATUH TEMPO HARI INI */}
        <div className="metis-card p-[18px] flex items-center gap-4">
          <div className="w-[44px] h-[44px] rounded-[8px] bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center text-[#dc2626] flex-shrink-0 text-[18px]">
            <i className="bi bi-bell"></i>
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-[#64748b]">JATUH TEMPO HARI INI</div>
            <div className="text-[22px] font-bold text-[#0f172a] leading-snug mt-0.5">
              {mockDashboardStats.dueTodayCount} Item
            </div>
            <div className="text-[11.5px] mt-0.5 flex items-center gap-1">
              <span className="text-[#dc2626] font-semibold">4 item kritis</span>
              <span className="text-[#64748b]">· perlu repetisi</span>
            </div>
          </div>
        </div>

        {/* Card 2: RATA-RATA PENGUASAAN */}
        <div className="metis-card p-[18px] flex items-center gap-4">
          <div className="w-[44px] h-[44px] rounded-[8px] bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center text-[#198754] flex-shrink-0 text-[18px]">
            <i className="bi bi-graph-up"></i>
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-[#64748b]">RATA-RATA PENGUASAAN</div>
            <div className="text-[22px] font-bold text-[#0f172a] leading-snug mt-0.5">
              {mockDashboardStats.masteryPercentage}%
            </div>
            <div className="text-[11.5px] mt-0.5 flex items-center gap-1">
              <span className="text-[#64748b]">↑</span>
              <span className="text-[#198754] font-semibold">+4.5%</span>
              <span className="text-[#64748b]">dari minggu lalu</span>
            </div>
          </div>
        </div>

        {/* Card 3: HARI BERUNTUN BELAJAR */}
        <div className="metis-card p-[18px] flex items-center gap-4">
          <div className="w-[44px] h-[44px] rounded-[8px] bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center text-[#cc7a00] flex-shrink-0 text-[18px]">
            <i className="bi bi-fire"></i>
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-[#64748b]">HARI BERUNTUN</div>
            <div className="text-[22px] font-bold text-[#0f172a] leading-snug mt-0.5">
              {mockDashboardStats.streakDays} Hari
            </div>
            <div className="text-[11.5px] mt-0.5 flex items-center gap-1">
              <span className="text-[#198754] font-semibold">Konsisten</span>
              <span className="text-[#64748b]">· Rekor 8 hari</span>
            </div>
          </div>
        </div>

        {/* Card 4: HITUNG MUNDUR UJIAN */}
        <div className="metis-card p-[18px] flex items-center gap-4">
          <div className="w-[44px] h-[44px] rounded-[8px] bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center text-[#087990] flex-shrink-0 text-[18px]">
            <i className="bi bi-clock"></i>
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-[#64748b]">HITUNG MUNDUR UJIAN</div>
            <div className="text-[22px] font-bold text-[#0f172a] leading-snug mt-0.5">
              {mockDashboardStats.daysUntilExam} Hari
            </div>
            <div className="text-[11.5px] mt-0.5 flex items-center gap-1">
              <span className="text-[#087990] font-semibold">20 Nov 2026</span>
              <span className="text-[#64748b]">· {mockDashboardStats.examName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: PROGRES MINGGUAN & DISTRIBUSI STATUS RETENSI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Progres Latihan Mingguan (8 cols) */}
        <div className="metis-card lg:col-span-8 flex flex-col">
          <div className="metis-card-header">
            <div>
              <h2 className="metis-card-title">Progres Latihan Mingguan</h2>
              <p className="text-[12px] text-[#64748b] mt-0.5">
                Jumlah item anatomi yang dilatih 7 hari terakhir (Target: 20 item/hari)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-completed">Target Tercapai 5/7 Hari</span>
            </div>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="w-full h-[260px] relative">
              <canvas ref={weeklyChartRef}></canvas>
            </div>
            <div className="mt-3 pt-3 border-t border-[#f1f5f9] grid grid-cols-3 gap-2 text-center text-[12px]">
              <div>
                <span className="text-[#64748b] text-[11px] block">Total Item Dilatih</span>
                <strong className="text-[#0f172a] text-[15px] font-bold">142 Item</strong>
              </div>
              <div>
                <span className="text-[#64748b] text-[11px] block">Rata-rata Harian</span>
                <strong className="text-[#0d6efd] text-[15px] font-bold">20.2 / hari</strong>
              </div>
              <div>
                <span className="text-[#64748b] text-[11px] block">Akurasi Rerata</span>
                <strong className="text-[#198754] text-[15px] font-bold">86% Benar</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Distribusi Penguasaan Materi (4 cols) */}
        <div className="metis-card lg:col-span-4 flex flex-col">
          <div className="metis-card-header">
            <h2 className="metis-card-title">Distribusi Penguasaan Materi</h2>
          </div>
          <div className="p-5 flex-1 flex flex-col items-center justify-center">
            <div className="w-[190px] h-[190px] relative">
              <canvas ref={distributionChartRef}></canvas>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] text-[#64748b]">Rata-rata</span>
                <span className="text-[20px] font-bold text-[#0f172a] leading-tight">68%</span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full grid grid-cols-2 gap-2 mt-4 text-[11.5px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#198754]"></span>
                <span className="text-[#475569]">Dikuasai (42%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#087990]"></span>
                <span className="text-[#475569]">Cukup Baik (28%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#cc7a00]"></span>
                <span className="text-[#475569]">Perlu Latihan (18%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></span>
                <span className="text-[#475569]">Kritis (12%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: PETA KELEMAHAN PER TOPIK ANATOMI (TABLE FORMAT MATCHING TEMPLATE) */}
      <div className="metis-card mb-5">
        <div className="metis-card-header">
          <div>
            <h2 className="metis-card-title">Peta Kelemahan Topik Anatomi</h2>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Silabus 3 Modul Praktikum (Muskuloskeletal, Respirasi, Kardiovaskuler) · Diurutkan dari topik yang paling kritis
            </p>
          </div>
          <Link href="/kelemahan" className="text-[12.5px] font-semibold text-[#0d6efd] hover:underline">
            Lihat Analisis Detail →
          </Link>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full orders-table border-collapse">
            <thead>
              <tr>
                <th className="w-[30%]">TOPIK ANATOMI</th>
                <th className="w-[20%]">SISTEM</th>
                <th className="w-[25%]">PENGUASAAN</th>
                <th className="w-[15%]">STATUS</th>
                <th className="w-[10%] text-right">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {mockAnatomyWeaknesses.map((topic, idx) => {
                let badgeClass = "badge-completed";
                let statusText = "Dikuasai";
                let progressColor: "red" | "yellow" | "teal" | "green" = "green";

                if (topic.urgencyLevel === "kritis") {
                  badgeClass = "bg-[#dc2626] text-white text-[11px] font-semibold px-2 py-0.5 rounded-[4px]";
                  statusText = "Kritis (Prioritas)";
                  progressColor = "red";
                } else if (topic.urgencyLevel === "sedang") {
                  badgeClass = "badge-pending";
                  statusText = "Perlu Latihan";
                  progressColor = "yellow";
                } else if (topic.urgencyLevel === "baik") {
                  badgeClass = "badge-shipped";
                  statusText = "Cukup Baik";
                  progressColor = "teal";
                }

                return (
                  <tr key={topic.id} className={idx === 0 ? "bg-[#fff5f5]/50" : ""}>
                    <td>
                      <div className="font-semibold text-[#0f172a] flex items-center gap-1.5">
                        {topic.topicNameIndo}
                        {idx === 0 && (
                          <span className="text-[10px] font-bold bg-[#dc2626] text-white px-1.5 py-0.2 rounded-[3px]">
                            Terlemah
                          </span>
                        )}
                      </div>
                      <div className="text-[11.5px] italic text-[#64748b]">{topic.topicNameLatin}</div>
                    </td>
                    <td className="text-[#475569]">{topic.system}</td>
                    <td>
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <ProgressBar value={topic.masteryScore} color={progressColor} size="sm" />
                        <span className="text-[12px] font-bold text-[#1e293b] min-w-[32px]">
                          {topic.masteryScore}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={badgeClass}>{statusText}</span>
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/latihan?topik=${topic.system.toLowerCase().replace("regio ", "")}`}
                        className="h-[28px] px-2.5 bg-[#f1f5f9] hover:bg-[#0d6efd] hover:text-white text-[#1e293b] text-[11.5px] font-semibold rounded-[4px] inline-flex items-center justify-center transition"
                      >
                        Latih 3D
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROW 4: REKOMENDASI LATIHAN HARI INI */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[16px] font-semibold text-[#1e293b]">Rekomendasi Latihan Hari Ini</h2>
            <p className="text-[12px] text-[#64748b]">
              Topik pilihan algoritma Spaced Repetition untuk efisiensi belajar optimal
            </p>
          </div>
          <span className="badge-shipped">3 Sesi Direkomendasikan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {mockRecommendations.map((rec) => {
            let badgeClass = "badge-completed";
            if (rec.priority === "tinggi") badgeClass = "bg-[#dc2626] text-white text-[11px] font-semibold px-2 py-0.5 rounded-[4px]";
            if (rec.priority === "sedang") badgeClass = "badge-pending";

            return (
              <div key={rec.id} className="metis-card p-5 flex flex-col justify-between hover:shadow-sm transition">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
                      {rec.category}
                    </span>
                    <span className={badgeClass}>
                      {rec.priority === "tinggi" ? "Prioritas Utama" : rec.priority === "sedang" ? "Jatuh Tempo" : "Penyegaran"}
                    </span>
                  </div>

                  <h3 className="text-[14px] font-bold text-[#1e293b] leading-snug">
                    {rec.title}
                  </h3>
                  <p className="text-[11.5px] italic text-[#64748b] mt-0.5">
                    {rec.latinName}
                  </p>

                  <div className="mt-3 p-3 bg-[#f8f9fa] border border-[#eef2f6] rounded-[6px] text-[12px] text-[#475569]">
                    <strong className="block text-[#1e293b] mb-0.5 font-semibold">Alasan Rekomendasi:</strong>
                    <span>{rec.reason}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                  <div className="text-[11.5px] text-[#64748b]">
                    <span><strong className="text-[#0f172a]">{rec.dueCount}</strong> item</span> · ~{rec.estimatedMinutes} menit
                  </div>
                  <button
                    onClick={() => showToast(`Memulai modul: ${rec.title}`)}
                    className="h-[30px] px-3 bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-[12px] font-semibold rounded-[5px] flex items-center gap-1 shadow-2xs transition"
                  >
                    <span>Mulai</span>
                    <i className="bi bi-chevron-right text-[11px]"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROW 5: CHECKLIST TARGET HARIAN */}
      <div className="metis-card mb-5">
        <div className="metis-card-header">
          <div>
            <h2 className="metis-card-title">Target Belajar Hari Ini</h2>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Centang target yang telah diselesaikan untuk memperbarui progres harian
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={checklistPercent === 100 ? "badge-completed" : "badge-shipped"}>
              {completedCount} dari {totalCount} Selesai ({checklistPercent}%)
            </span>
            <button
              onClick={() => {
                setChecklist(mockDailyChecklist);
                showToast("Target harian berhasil direset");
              }}
              className="text-[12px] text-[#64748b] hover:text-[#0f172a] p-1 flex items-center gap-1"
              title="Reset checklist"
            >
              <i className="bi bi-arrow-clockwise"></i>
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-[12px] text-[#475569] mb-1.5 font-medium">
              <span>Pencapaian Target Harian</span>
              <span className="font-bold text-[#0f172a]">{checklistPercent}%</span>
            </div>
            <ProgressBar
              value={checklistPercent}
              color={checklistPercent === 100 ? "green" : "blue"}
              size="md"
            />
          </div>

          {/* 100% Notice */}
          {checklistPercent === 100 && (
            <div className="mb-4 p-3 bg-[#e8f5e9] border border-[#c8e6c9] rounded-[6px] text-[#1b5e20] text-[12.5px] flex items-center gap-2 font-medium">
              <i className="bi bi-check-circle-fill text-[16px]"></i>
              <span>Luar biasa, seluruh target hari ini tuntas 100%! Retensi materi ujian semakin solid.</span>
            </div>
          )}

          {/* Checklist Items */}
          <div className="border border-[#e2e8f0] rounded-[6px] divide-y divide-[#e2e8f0] bg-white">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item.id)}
                className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition hover:bg-[#f8f9fa] ${
                  item.completed ? "bg-[#f8fafc]" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleChecklist(item.id)}
                    className="w-4 h-4 text-[#0d6efd] rounded border-[#cbd5e1] focus:ring-[#0d6efd] cursor-pointer"
                  />
                  <div className="min-w-0">
                    <span
                      className={`text-[13px] ${
                        item.completed ? "line-through text-[#94a3b8]" : "font-medium text-[#1e293b]"
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.latinTerm && (
                      <span className="block text-[11px] italic text-[#64748b]">
                        {item.latinTerm}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                    {item.tag}
                  </span>
                  <span className="text-[11.5px] font-semibold text-[#64748b]">
                    {item.itemCount} item
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
