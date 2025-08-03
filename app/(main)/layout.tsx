import type { Metadata } from "next";
import "../globals.css";
import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "MockA",
  description: "Mock API Server",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="flex">
        <div className="w-[--sidebar-width] fixed h-screen border-r hidden md:block">
          <Sidebar />
        </div>
        <div className="flex flex-col ml-0 md:ml-[--sidebar-width] w-[calc(100vw-var(--sidebar-width))]">
          <Topbar />
          <div className="flex-1 flex flex-col items-center pt-16">
            <main className="container p-6">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
