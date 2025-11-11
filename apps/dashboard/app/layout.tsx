import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/query-povider";
import { TooltipProvider } from "@/components/ui/tooltip";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mocknica - Open-Source AI-Powered Mock API Platform",
  description: "Create, manage, and deploy realistic mock APIs in seconds with AI. Build faster, test smarter, and ship with confidence. 100% open source.",
  keywords: ["mock api", "api mocking", "development tools", "testing", "frontend development", "open source", "AI-powered"],
  authors: [{ name: "Mocknica Team" }],
  openGraph: {
    title: "Mocknica - Open-Source AI-Powered Mock API Platform",
    description: "Create, manage, and deploy realistic mock APIs in seconds with AI. Build faster, test smarter, and ship with confidence.",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <NextTopLoader color="hsl(var(--primary))" showSpinner={false} />
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
