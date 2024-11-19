import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
