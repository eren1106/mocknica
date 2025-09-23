"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { NavItem } from "@/types/navigation";
import { Badge } from "@/components/ui/badge";

interface NavItemLinkProps {
  item: NavItem;
  href: string;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}

export const NavItemLink = ({
  item,
  href,
  isActive,
  onClick,
  className,
}: NavItemLinkProps) => {
  const IconComponent = item.icon;

  return (
    <Link
      href={href}
      className={cn("w-full", className)}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
    >
      <div
        className={cn(
          "group flex items-center justify-start gap-3 p-3 w-full rounded-lg transition-colors duration-200",
          "hover:bg-secondary/80 hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isActive 
            ? "bg-secondary text-foreground shadow-sm" 
            : "text-muted-foreground"
        )}
      >
        <IconComponent 
          size={16} 
          className={cn(
            "transition-colors duration-200",
            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
          )} 
        />
        <span className="text-sm font-medium flex-1">{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" className="text-xs">
            {item.badge}
          </Badge>
        )}
      </div>
    </Link>
  );
};