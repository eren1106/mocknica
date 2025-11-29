"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  LinkButton,
  ModeToggle,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@mocknica/ui";
import { Menu } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { FaGithub, FaStar } from "react-icons/fa";
import { config } from "../../lib/config";

const NAV_ITEMS = [
  { href: "#features", label: "Features" },
  { href: "#use-cases", label: "Use Cases" },
] as const;

const GITHUB_URL = "https://github.com/eren1106/mocknica";
const LOGIN_URL = `${config.dashboardUrl}/login`;

// GitHub Star Button Component
const GitHubStarButton = ({
  mobile = false,
  className = "",
}: {
  mobile?: boolean;
  className?: string;
}) => (
  <LinkButton
    href={GITHUB_URL}
    variant="outline"
    className={`group inline-flex items-center gap-2 text-sm ${
      mobile ? "w-full" : "w-full md:w-auto"
    } ${className}`}
  >
    <div className="flex items-center">
      <FaGithub className="mr-1 size-4" />
      <span className="ml-1 lg:hidden">Star</span>
      <span className="ml-1 hidden lg:inline">GitHub</span>
    </div>
    <div className="flex items-center gap-1 text-sm">
      <FaStar className="relative size-3 fill-gray-400 duration-300 group-hover:fill-yellow-400 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
    </div>
  </LinkButton>
);

// Navigation Links Component
const NavigationLinks = ({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) => (
  <>
    {NAV_ITEMS.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={
          mobile
            ? "block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            : "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        }
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    ))}
  </>
);

// Sign In Button Component
const SignInButton = ({
  mobile = false,
  onClick,
}: {
  mobile?: boolean;
  onClick?: () => void;
}) => (
  <LinkButton
    href={LOGIN_URL}
    className={mobile ? "w-full justify-center" : ""}
    onClick={onClick}
  >
    Sign In
  </LinkButton>
);

// Actions Group Component (GitHub + Sign In)
const ActionButtons = ({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) => (
  <div className={mobile ? "space-y-4" : "flex items-center space-x-4"}>
    {mobile && <GitHubStarButton mobile />}
    {!mobile && (
      <>
        <ModeToggle />
        <GitHubStarButton />
      </>
    )}
    <SignInButton mobile={mobile} onClick={onNavigate} />
  </div>
);

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14 flex items-center">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Desktop Navigation */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <BrandLogo />
            </Link>
            <div className="hidden md:flex md:items-center md:space-x-8">
              <NavigationLinks />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex">
            <ActionButtons />
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetContent side="right" className="w-[85vw] sm:w-[350px] p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <BrandLogo size="sm" showBeta={false} />
                  <ModeToggle />
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                  <NavigationLinks mobile onNavigate={closeMobileMenu} />
                </nav>

                {/* Footer */}
                <div className="p-4 border-t">
                  <ActionButtons mobile onNavigate={closeMobileMenu} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
