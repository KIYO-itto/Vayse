import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cinzel } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deception: Murder in Hong Kong — Multiplayer",
  description:
    "Jogo social de dedução multiplayer inspirado em Deception: Murder in Hong Kong. Crie uma sala, junte-se pelo código e descubra o assassino.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a08",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${cinzel.variable} bg-[#0a0a08] text-zinc-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
