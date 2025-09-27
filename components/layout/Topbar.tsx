"use client";

import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import SidebarSheet from "./SidebarSheet";
import { UserNav } from "../user-nav";
import { ProjectEndpointBaseUrlDisplay } from "./ProjectEndpointBaseUrlDisplay";

interface ITopbarProps {
  className?: string;
}
const Topbar = ({ className }: ITopbarProps) => {
  const params = useParams();
  const projectId = params?.id as string | undefined;

  return (
    <header 
      className={cn(
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "w-full md:w-[calc(100vw-var(--sidebar-width))]",
        "fixed top-0 z-50 h-[--topbar-height]",
        "border-b border-border/40",
        "flex items-center justify-between px-3 sm:px-4 lg:px-6",
        "shadow-sm",
        className
      )}
    >
      {/* Left Section - Mobile Menu + API Endpoint */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <SidebarSheet />
        {projectId && (
          <ProjectEndpointBaseUrlDisplay 
            projectId={projectId}
            className="min-w-0 flex-1 hidden sm:block"
          />
        )}
      </div>

      {/* Right Section - User Navigation */}
      <div className="flex items-center gap-1 sm:gap-2">
        <UserNav />
      </div>
    </header>
  );
};

export default Topbar;
