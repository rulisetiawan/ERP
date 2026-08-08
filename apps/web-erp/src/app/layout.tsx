import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatusBar } from "@/components/StatusBar";

export const metadata: Metadata = {
  title: "ERP POS Enterprise System",
  description: "Web ERP & POS Management Portal for Multi-Outlet Business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <Sidebar />
        <Header />
        <main className="pl-64 pt-16 pb-8 min-h-screen bg-slate-950">
          <div className="p-6">{children}</div>
        </main>
        <StatusBar />
      </body>
    </html>
  );
}
