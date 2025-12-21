import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-provider";
import { LimitsProvider } from "@/hooks/useLimits";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ContaSync - Gestão Contábil",
  description: "Plataforma SaaS para gestão contábil multi-cliente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <LimitsProvider>
            {children}
            <Toaster />
          </LimitsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
