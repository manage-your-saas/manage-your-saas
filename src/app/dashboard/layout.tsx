"use client"

// app/(dashboard)/layout.tsx
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@/styles/themes.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
