import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";  

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fanta x Xbox",
  description: "¡Participa en la promoción de Fanta x Xbox y gana increíbles premios!",
  // AGREGAMOS EL ICONO AQUÍ
  icons: {
    icon: "/fantaicon.svg",
    // Opcional: puedes agregar el apple-touch-icon si lo deseas
    apple: "/fantaicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}