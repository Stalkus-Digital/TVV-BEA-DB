import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Vacation Voice - Travel OS",
  description: "Modern SaaS admin dashboard for The Vacation Voice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
