import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { esMX } from "@clerk/localizations";

export const metadata: Metadata = {
  title: "FreshBites",
  description:
    "FreshBites es la plataforma definitiva diseñada específicamente para estudiantes universitarios que buscan cocinar de manera inteligente, saludable y económica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esMX}>
      <html lang="es">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
