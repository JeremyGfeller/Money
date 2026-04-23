import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MoneyPilot - Budget personnel",
    short_name: "MoneyPilot",
    description:
      "Application personnelle pour suivre revenus, dépenses, budgets et objectifs d'épargne.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8faf8",
    theme_color: "#11a566",
    lang: "fr",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
