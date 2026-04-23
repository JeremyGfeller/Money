import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: {
    default: "MoneyPilot - Budget personnel",
    template: "%s - MoneyPilot",
  },
  description:
    "Suivez vos revenus, dépenses, budgets et objectifs d'épargne dans une application simple, moderne et installable.",
  applicationName: "MoneyPilot",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "MoneyPilot",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#11a566" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2f26" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
