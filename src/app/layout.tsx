import type { Metadata } from "next";
import { Tajawal, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ناشئة الشارقة - بوابة إنجازات الناشئة",
  description: "بوابة إنجازات الناشئة في الشارقة - تتبع الإنجازات، الشارات الرقمية، وإدارة الأنشطة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${tajawal.variable} ${cairo.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
