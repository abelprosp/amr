import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getProfile } from "./lib/auth/get-profile";
import { AuthProvider } from "./components/AuthProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IA da Redobrai",
  description: "Painel de Inteligência Artificial da Redobrai",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-0`}
      >
        <AuthProvider initialProfile={profile}>
          <div className="flex flex-col flex-1 min-h-0 w-full max-w-full overflow-x-hidden overflow-y-hidden">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
