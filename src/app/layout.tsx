import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/tajawal/arabic.css";
import "@fontsource/cairo/arabic.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

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
        className="antialiased bg-background text-foreground"
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
