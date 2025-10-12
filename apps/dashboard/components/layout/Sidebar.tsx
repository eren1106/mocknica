"use client";

import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProject } from "@/hooks/useProject";
import { NAV_ITEMS, PROJECT_NAV_ITEMS } from "@/constants/nav-items";
import { Badge } from "../ui/badge";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";
import { NavItemLink } from "./NavItemLink";
import { BrandLogo } from "./BrandLogo";
import { ProjectErrorState } from "./ProjectErrorState";
import {
  checkIsNavSelected,
  checkIsProjectNavSelected,
  getNavHref,
  getProjectNavHref,
  isInProjectContext,
} from "@/lib/navigation-utils";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface ISidebarProps {
  onNavItemClicked?: () => void;
}
const Sidebar = ({ onNavItemClicked }: ISidebarProps) => {
  const pathname = usePathname();
  const projectId = useCurrentProjectId();
  const isInProject = isInProjectContext(pathname, projectId);

  const {
    data: project,
    isLoading: isLoadingProject,
    error,
  } = useProject(projectId || "");

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 border-b bg-background/80">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <BrandLogo />
        </Link>
        <div className="block md:hidden">
          <ModeToggle />
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 flex flex-col gap-3 p-4">
          {/* Default Navigation */}
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const href = getNavHref(item.to);
              const isActive =
                checkIsNavSelected(item.to, pathname) && !isInProject;

              return (
                <NavItemLink
                  key={item.to}
                  item={item}
                  href={href}
                  isActive={isActive}
                  onClick={onNavItemClicked}
                />
              );
            })}
          </div>

          {/* Project Navigation */}
          {isInProject && (
            <>
              {/* Loading State */}
              {isLoadingProject && (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <div className="px-3 py-2 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="space-y-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !isLoadingProject && (
                <ProjectErrorState error="Failed to load project details" />
              )}

              {/* Success State */}
              {!isLoadingProject && !error && (
                <>
                  {/* Project Info */}
                  {project && (
                    <Card className="space-y-2 p-4">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Current Project
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs">
                          {project.name}
                        </Badge>
                      </div>
                    </Card>
                  )}

                  {/* Project Navigation Items */}
                  <div className="space-y-1">
                    {PROJECT_NAV_ITEMS.map((item) => {
                      const href = getProjectNavHref(item.to, projectId || "");
                      const isActive = checkIsProjectNavSelected(
                        item.to,
                        pathname,
                        projectId || ""
                      );

                      return (
                        <NavItemLink
                          key={item.to}
                          item={item}
                          href={href}
                          isActive={isActive}
                          onClick={onNavItemClicked}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </nav>

        {/* Footer */}
        {/* <div className="border-t bg-background/50 p-4">
          <div className="text-xs text-muted-foreground text-center">
            Mocknica v1.0.0
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Sidebar;
