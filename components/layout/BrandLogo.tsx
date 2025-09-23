import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    container: "size-6",
    icon: "size-3",
    text: "text-sm",
  },
  md: {
    container: "size-8",
    icon: "size-4",
    text: "text-lg",
  },
  lg: {
    container: "size-10",
    icon: "size-5",
    text: "text-xl",
  },
};

export const BrandLogo = ({ 
  size = "md", 
  showText = true, 
  className 
}: BrandLogoProps) => {
  const { container, icon, text } = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center",
        container
      )}>
        <svg
          className={cn("text-primary-foreground", icon)}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      {showText && (
        <h1 className={cn(
          "font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent",
          text
        )}>
          MockA
        </h1>
      )}
    </div>
  );
};