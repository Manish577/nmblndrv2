import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/ui/app-providers";

export const metadata: Metadata = {
  title: "Chess Analysis",
  description: "Personalized chess insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0f0f0f] text-white">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
