import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-expect-error -- Next.js supports global CSS imports in app/layout.tsx
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Assignment & Submission Management System",
  description:
    "Role-based assignment and submission management system for schools and colleges — Admin, Teacher and Student portals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
