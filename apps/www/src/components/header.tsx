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

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "#features", label: "Features" },
    { href: "#use-cases", label: "Use Cases" },
  ];

  // GitHub Star Button Component
  const GitHubStarButton = () => (
    // <Link
    //   href="https://github.com/eren1106/mocknica"
    //   target="_blank"
    //   rel="noopener noreferrer"
    //   className="group inline-flex h-8 items-center gap-2 rounded-lg bg-black px-2 text-sm text-white transition-colors hover:bg-black/90"
    // >
    //   <div className="flex items-center text-white">
    //     <FaGithub className="mr-1 size-4 fill-white" />
    //     <span className="ml-1 lg:hidden">Star</span>
    //     <span className="ml-1 hidden lg:inline">GitHub</span>
    //   </div>
    //   <div className="flex items-center gap-1 text-sm">
    //     <FaStar className="relative size-3 fill-gray-400 duration-300 group-hover:fill-yellow-400 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
    //     {/* <p className="tabular-nums">100</p> */}
    //   </div>
    // </Link>
    <LinkButton
      href="https://github.com/eren1106/mocknica"
      openNewTab
      variant="outline"
      className="group inline-flex items-center gap-2 text-sm"
    >
      <div className="flex items-center">
        <FaGithub className="mr-1 size-4" />
        <span className="ml-1 lg:hidden">Star</span>
        <span className="ml-1 hidden lg:inline">GitHub</span>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <FaStar className="relative size-3 fill-gray-400 duration-300 group-hover:fill-yellow-400 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
        {/* <p className="tabular-nums">100</p> */}
      </div>
    </LinkButton>
  );

  // CTA Buttons Component
  const CTAButtons = ({ className = "" }) => (
    <div className={`flex items-center space-x-4 ${className}`}>
      <LinkButton
        href={`${config.dashboardUrl}/login`}
        openNewTab
        variant="ghost"
      >
        Sign In
      </LinkButton>
      <LinkButton href={`${config.dashboardUrl}/signup`} openNewTab>
        Get Started
      </LinkButton>
    </div>
  );

  // Navigation Links Component
  const NavigationLinks = ({ mobile = false }) => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={
            mobile
              ? "block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              : "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          }
          onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BrandLogo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <NavigationLinks />
          </div>

          {/* Desktop Right Section - Theme Toggle, GitHub, CTA */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <ModeToggle />
            <GitHubStarButton />
            <CTAButtons />
          </div>

          {/* Mobile Menu Button */}
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
                {/* Sheet Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <BrandLogo size="sm" showBeta={false} />
                  <ModeToggle />
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-1">
                  <NavigationLinks mobile />
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t space-y-4">
                  <GitHubStarButton />
                  <div className="flex flex-col space-y-2">
                    <LinkButton
                      href={`${config.dashboardUrl}/login`}
                      openNewTab
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </LinkButton>
                    <LinkButton
                      href={`${config.dashboardUrl}/signup`}
                      openNewTab
                      className="w-full justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </LinkButton>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
