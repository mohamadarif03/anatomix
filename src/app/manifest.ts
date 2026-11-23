import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ANATOMIX - Platform Edukasi Anatomi 3D & Review Medis Adaptif",
    short_name: "ANATOMIX",
    description: "Aplikasi pendamping belajar mandiri untuk mahasiswa kedokteran preklinik",
    start_url: "/beranda",
    display: "standalone",
    background_color: "#0d6efd",
    theme_color: "#0d6efd",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
