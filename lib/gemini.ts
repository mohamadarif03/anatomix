/**
 * Gemini AI Helper untuk ANATOMIX
 * Mendukung pemanggilan live Google Gemini 1.5 Flash API dengan fallback kurikulum medis cerdas.
 */

export interface GeneratedSummary {
  overview: string;
  subtopics: Array<{
    id: string;
    title: string;
    latinTerm: string;
    overview: string;
    keyPoints: string[];
    keyTerms: Array<{
      term: string;
      latin: string;
      definition: string;
    }>;
    clinicalCorrelation: string;
  }>;
  clinicalPoints: string[];
}

export interface GeneratedQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "mudah" | "sedang" | "sulit";
  latinTerms?: string[];
}

export async function generateGeminiQuizQuestions(params: {
  materialTitle: string;
  region: string;
  count?: number;
}): Promise<GeneratedQuizQuestion[]> {
  const { materialTitle, region, count = 5 } = params;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      console.log(`🤖 Memanggil Gemini 2.5 Flash API untuk membuat ${count} soal kuis: "${materialTitle}"...`);
      const prompt = `Anda adalah dosen penguji anatomi & kedokteran untuk mahasiswa kedokteran preklinik (ANATOMIX).
Buatkan ${count} butir soal pilihan ganda berbasis kasus klinis (clinical vignette) untuk topik: "${materialTitle}" pada regio tubuh "${region}".

Kriteria soal:
1. Soal diawali skenario pasien realistis (usia, keluhan, riwayat trauma/pemeriksaan fisis).
2. Terdapat 4 atau 5 pilihan jawaban (A, B, C, D, E) dengan istilah anatomi/Latin yang tepat.
3. Sertakan kunci jawaban (huruf opsi, misal "A") dan penjelasan ilmiah mendalam.

Keluarkan dalam format JSON murni berbentuk array:
[
  {
    "id": "q-ai-1",
    "question": "Kasus vignette klinis lengkap...",
    "options": ["A. Pilihan A", "B. Pilihan B", "C. Pilihan C", "D. Pilihan D", "E. Pilihan E"],
    "correctAnswer": "A",
    "explanation": "Pembahasan medis detail kenapa opsi ini benar dan opsi lain salah.",
    "difficulty": "sedang",
    "latinTerms": ["Terminologia Anatomica 1", "Terminologia Anatomica 2"]
  }
]`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`✅ Berhasil men-generate ${parsed.length} soal kuis klinis dengan Gemini 2.5 Flash!`);
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ Gagal memanggil Gemini untuk kuis, beralih ke fallback bank soal:", err);
    }
  }

  return generateFallbackQuizQuestions(materialTitle, region);
}

function generateFallbackQuizQuestions(title: string, region: string): GeneratedQuizQuestion[] {
  return [
    {
      id: `q-fb-${Date.now()}-1`,
      question: `Seorang pasien datang dengan keluhan kelemahan fungsional pada regio ${region}. Dari pemeriksaan radiologis, dicurigai terjadi kompresi pada struktur vaskular dan saraf utama di area tersebut. Struktur manakah yang paling rentan mengalami cedera?`,
      options: [
        `A. Ramus profundus arteria principalis regio ${region}`,
        `B. Fascia superficialis dan jaringan subkutan`,
        `C. Tendo musculi stabilisator articulationis`,
        `D. Vena comitans superfisialis`,
      ],
      correctAnswer: "A",
      explanation: `Struktur neurovaskular profunda yang melewati kompartemen osteofibrosa sempit pada regio ${region} memiliki kerentanan paling tinggi terhadap sindrom kompresi atau iskemia sekunder.`,
      difficulty: "sedang",
      latinTerms: [`Regio ${region}`, "Vasa et Nervi Profundi"],
    },
    {
      id: `q-fb-${Date.now()}-2`,
      question: `Pada tindakan diseksi anatomis regio ${region}, orientasi topografis dipandu oleh landmark tulang dan batas muskular penanda. Struktur batas manakah yang memisahkan kompartemen anterior dan posterior?`,
      options: [
        "A. Septum intermusculare",
        "B. Tunica intima pembuluh darah",
        "C. Perichondrium cartilaginis",
        "D. Membrana mucosa parietalis",
      ],
      correctAnswer: "A",
      explanation: "Septum intermusculare yang merupakan perluasan fascia profunda memisahkan kompartemen otot anterior dan posterior pada ekstremitas dan dinding regio tubuh.",
      difficulty: "mudah",
      latinTerms: ["Septum intermusculare", "Fascia profunda"],
    },
  ];
}

export async function generateGeminiSummary(params: {
  title: string;
  region: string;
  extractedText?: string;
}): Promise<GeneratedSummary> {
  const { title, region, extractedText } = params;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      console.log(`🤖 Memanggil Gemini 1.5 Flash API untuk merangkum: "${title}"...`);
      const prompt = `Anda adalah asisten AI medis untuk mahasiswa kedokteran preklinik (ANATOMIX - Platform Edukasi Anatomi 3D & Review Medis Adaptif).
Tugas Anda adalah merangkum materi kuliah anatomi/kedokteran berikut menjadi rangkuman terstruktur dengan nomenklatur Latin resmi.

Materi: "${title}"
Regio Tubuh: "${region}"
${extractedText ? `Teks Materi Kuliah:\n"""\n${extractedText.slice(0, 8000)}\n"""` : ""}

Keluarkan dalam format JSON murni dengan skema berikut:
{
  "overview": "Paragraf ringkasan eksekutif komprehensif mengenai materi ini",
  "subtopics": [
    {
      "id": "sub-1",
      "title": "Judul Subtopik 1 (Bahasa Indonesia)",
      "latinTerm": "Nama Latin / Terminologi Anatomi",
      "overview": "Penjelasan konsep subtopik ini (2-3 kalimat)",
      "keyPoints": [
        "Poin penting 1 dengan detail anatomi/fisiologi",
        "Poin penting 2",
        "Poin penting 3"
      ],
      "keyTerms": [
        {
          "term": "Istilah Indonesia",
          "latin": "Terminologia Anatomica",
          "definition": "Definisi singkat dan fungsi klinisnya"
        }
      ],
      "clinicalCorrelation": "Korelasi klinis atau kasus penyakit yang sering muncul pada ujian/koas"
    }
  ],
  "clinicalPoints": [
    "Poin klinis krusial 1",
    "Poin klinis krusial 2"
  ]
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (parsed.overview && Array.isArray(parsed.subtopics)) {
            console.log("✅ Rangkuman berhasil di-generate langsung oleh Gemini 1.5 Flash!");
            return parsed;
          }
        }
      } else {
        const errText = await res.text();
        console.warn("⚠️ Panggilan Gemini API mengembalikan non-OK:", res.status, errText);
      }
    } catch (apiError) {
      console.warn("⚠️ Gagal menghubungi Gemini API, mengalihkan ke engine kurikulum lokal:", apiError);
    }
  }

  // Fallback: Smart Medical Curriculum Generator jika API key belum diisi atau kuota habis
  return generateFallbackMedicalSummary(title, region);
}

function generateFallbackMedicalSummary(title: string, region: string): GeneratedSummary {
  const regCapital = region.charAt(0).toUpperCase() + region.slice(1).toLowerCase();

  return {
    overview: `Rangkuman komprehensif untuk materi ${title} pada regio ${regCapital}. Memuat deskripsi morfologi makroskopis, batas topografis, aparatus organ, vaskularisasi arteri-vena, serta jaras inervasi motorik dan sensorik.`,
    subtopics: [
      {
        id: `sub-${Date.now()}-1`,
        title: `Morfologi Eksterna & Batas Topografis ${regCapital}`,
        latinTerm: `Morfologia Externa Regio ${regCapital}`,
        overview: `Analisis letak spasial dan hubungan anatomi antara struktur pada regio ${regCapital} dengan organ-organ di sekitarnya.`,
        keyPoints: [
          `Identifikasi fascia dan lapisan kompartemen pelindung utama pada regio ${regCapital}.`,
          `Batas-batas anatomis penting untuk orientasi diseksi dan eksplorasi klinis.`,
          `Struktur penyokong osteoartikular dan ligamentum fiksasi.`,
        ],
        keyTerms: [
          {
            term: `Struktur Kunci ${regCapital}`,
            latin: `Structura Principalis Regio ${regCapital}`,
            definition: `Komponen fungsional utama yang membentuk regio ${regCapital}.`,
          },
          {
            term: "Fascia Penutup",
            latin: "Fascia profunda",
            definition: "Jaringan ikat fibrosa padat pembungkus kelompok otot dan neurovaskular.",
          },
        ],
        clinicalCorrelation: `Pemahaman batas topografis sangat penting untuk menentukan akses bedah minimal invasif dan mencegah cedera iatrogenik struktur neurovaskular pada regio ${regCapital}.`,
      },
      {
        id: `sub-${Date.now()}-2`,
        title: `Vaskularisasi Regional & Drainase Limfatik`,
        latinTerm: `Vasa Sanguinea & Systema Lymphaticum`,
        overview: `Sistem percabangan arteri penyuplai oksigen, anyaman vena kolateral, dan alur aliran cairan limfe ke kelenjar getah bening regional.`,
        keyPoints: [
          `Percabangan trunkus arteri utama dan zona anastomose pembuluh darah.`,
          `Sistem vena superfisial dan vena profunda yang menyertai arteri (venae comitantes).`,
          `Nodus limfatikus penyaring pertama (sentinel node) dari area regio ${regCapital}.`,
        ],
        keyTerms: [
          {
            term: "Arteri Penyuplai",
            latin: "Arteria principalis",
            definition: "Pembuluh darah bertekanan tinggi penyedia perfusi jaringan lokal.",
          },
          {
            term: "Kelenjar Getah Bening",
            latin: "Nodi lymphoidei regionales",
            definition: "Pusat filtrasi limfe dan pertahanan imunologik terhadap penyebaran metastasis.",
          },
        ],
        clinicalCorrelation: `Iskemia akut akibat emboli atau oklusi trombus memerlukan revaskularisasi cepat dalam waktu emas (*golden period*) 6 jam untuk mencegah nekrosis jaringan.`,
      },
    ],
    clinicalPoints: [
      `Selalu konfirmasikan variasi anatomis vaskularisasi pada regio ${regCapital} sebelum tindakan operatif.`,
      `Gejala parestesia atau paresis mengindikasikan kompresi kompartemen yang membutuhkan dekompresi segera.`,
    ],
  };
}
