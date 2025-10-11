import type { Metadata } from "next";
import "../globals.css";
import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Mocknica",
  description: "Mock API Server",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <div className="w-[--sidebar-width] fixed h-screen border-r hidden md:block z-40">
        <Sidebar />
      </div>
      <div className="flex flex-col ml-0 md:ml-[--sidebar-width] w-full md:w-[calc(100vw-var(--sidebar-width))]">
        <Topbar />
        <AuthGuard>
          <div className="flex-1 flex flex-col items-center pt-[--topbar-height] bg-muted min-h-screen">
            <main className="container p-4 sm:p-6 md:p-8">{children}</main>
          </div>
        </AuthGuard>
      </div>
    </div>
  );
}
