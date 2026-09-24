import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindBetter — Daily memory training",
  description:
    "A guided memory-training practice built around encoding, retrieval, and review.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
