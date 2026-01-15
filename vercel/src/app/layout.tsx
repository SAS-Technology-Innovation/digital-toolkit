import type { Metadata } from "next";
import { DM_Sans, Bebas_Neue } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "SAS Digital Toolkit",
  description: "Applications and digital resources for the SAS community",
  icons: {
    icon: "/assets/sas-logo-icon.png",
    apple: "/assets/sas-logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${bebasNeue.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
