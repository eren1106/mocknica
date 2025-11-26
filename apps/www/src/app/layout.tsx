import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@mocknica/ui";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

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
  description:
    "Create, manage, and deploy realistic mock APIs in seconds with AI. Build faster, test smarter, and ship with confidence. 100% open source.",
  keywords: [
    "mock api",
    "api mocking",
    "development tools",
    "testing",
    "frontend development",
    "open source",
    "AI-powered",
  ],
  authors: [{ name: "Mocknica Team" }],
  openGraph: {
    title: "Mocknica - Open-Source AI-Powered Mock API Platform",
    description:
      "Create, manage, and deploy realistic mock APIs in seconds with AI. Build faster, test smarter, and ship with confidence.",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen">
            <Header />
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
