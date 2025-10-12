"use client";

import { cn } from "@/lib/utils";
import NextImage from "../next-image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showBeta?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    container: "size-6",
    text: "text-sm",
  },
  md: {
    container: "size-8",
    text: "text-lg",
  },
  lg: {
    container: "size-10",
    text: "text-xl",
  },
};

export const BrandLogo = ({
  size = "md",
  showText = true,
  showBeta = true,
  className,
}: BrandLogoProps) => {
  const { container, text } = sizeClasses[size];
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted on client before using theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a default theme during SSR to prevent hydration mismatch
  const currentTheme = mounted ? theme : "light";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <NextImage
        src={currentTheme === "dark" ? "/icon-dark.png" : "/icon-light.png"}
        alt="Logo"
        className={cn(container)}
      />
      {showText && (
        <h1
          className={cn(
            "font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent",
            text
          )}
        >
          Mocknica
        </h1>
      )}
      {showBeta && (
        <Badge className="text-xs" variant="outline">
          Beta
        </Badge>
      )}
    </div>
  );
};
