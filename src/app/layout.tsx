import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";

import { DemoUserSwitcher } from "@/components/engagements/DemoUserSwitcher";
import "./globals.css";

// Figma: Inter for UI & body text, Plus Jakarta Sans for headings.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXA — Real work. Right here.",
  description:
    "Short-term tasks from North East businesses, real experience for students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <DemoUserSwitcher />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
