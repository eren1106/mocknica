"use client";

import { cn, Badge, NextImage } from "@mocknica/ui";

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

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <NextImage
        src="/icon-dark.png"
        alt="Logo"
        className={cn(container, "hidden dark:block")}
        unoptimized // TODO: Remove this when Next.js supports dynamic imports for images
      />
      <NextImage
        src="/icon-light.png"
        alt="Logo"
        className={cn(container, "block dark:hidden")}
        unoptimized // TODO: Remove this when Next.js supports dynamic imports for images
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
