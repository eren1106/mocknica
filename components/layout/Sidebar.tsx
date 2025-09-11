"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useProject } from "@/hooks/useProject";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS, PROJECT_NAV_ITEMS } from "@/constants/nav-items";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

interface SidebarProps {
  onNavItemClicked?: () => void;
}

const Sidebar = (props: SidebarProps) => {
  const pathname = usePathname();
  const params = useParams();

  // Check if we're in a project context
  const projectId = params.id as string;
  const isInProject =
    pathname.startsWith("/projects/") && projectId && pathname !== "/projects";
  const { data: project, isLoading: isLoadingProject } = useProject(
    projectId || ""
  );

  const checkIsSelected = (to: string): boolean => {
    const normalizePath = (path: string): string => path.replace(/\/+$/, "");
    const currentPath = normalizePath(pathname);
    const rootPath = normalizePath("/");

    if (to === "") {
      return currentPath === rootPath;
    }

    const pathPrefix = normalizePath(`/${to}`);
    return currentPath.startsWith(pathPrefix);
  };

  const checkIsProjectNavSelected = (to: string): boolean => {
    const normalizePath = (path: string): string => path.replace(/\/+$/, "");
    const currentPath = normalizePath(pathname);

    if (to === "") {
      // For the overview page
      return currentPath === `/projects/${projectId}`;
    }

    const expectedPath = normalizePath(`/projects/${projectId}/${to}`);
    return currentPath === expectedPath;
  };

  return (
    <div className="flex flex-col px-3 py-6">
      <div className="flex justify-between mt-3 mb-5 items-center flex-wrap gap-3">
        <div className="flex gap-3 items-center">
          <Link href="/">
            <h1>MockA</h1>
          </Link>
        </div>
        <div className="block md:hidden">
          <ModeToggle />
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {/* If not in project context, show default navigation */}
        {!isInProject && (
          <>
            {NAV_ITEMS.map((item) => {
              const href = item.to === "" ? "/" : `/${item.to}`;
              const isActive = checkIsSelected(item.to);
              const IconComponent = item.icon;

              return (
                <Link
                  href={href}
                  className="w-full"
                  key={item.to}
                  onClick={props.onNavItemClicked}
                >
                  <div
                    className={cn(
                      "flex items-center justify-start gap-3 p-3 w-full rounded-lg hover:bg-secondary",
                      isActive ? "bg-secondary" : ""
                    )}
                  >
                    <IconComponent size={16} />
                    <p className="text-sm">{item.label}</p>
                  </div>
                </Link>
              );
            })}
          </>
        )}

        {/* If in project context, show back button and project nav */}
        {isInProject && (
          <>
            <Link href="/" className="w-full" onClick={props.onNavItemClicked}>
              <Button
                variant="ghost"
                className="justify-start gap-3 p-3 w-full h-auto"
              >
                <ArrowLeft className="size-5" />
                <span>Back to Home</span>
              </Button>
            </Link>

            {isLoadingProject ? (<Skeleton className="h-10" />) : project && (
              <div className="px-3 py-2 text-sm text-muted-foreground border-b mb-2">
                <div className="font-medium truncate">Project: <Badge variant="secondary">{project.name}</Badge></div>
              </div>
            )}

            {PROJECT_NAV_ITEMS.map((item) => {
              const selectedClassname = checkIsProjectNavSelected(item.to)
                ? "bg-secondary"
                : "";
              const IconComponent = item.icon;

              return (
                <Link
                  href={`/projects/${projectId}/${item.to}`}
                  className="w-full"
                  key={item.to}
                  onClick={props.onNavItemClicked}
                >
                  <div
                    className={cn(
                      "flex items-center justify-start gap-3 p-3 w-full rounded-lg hover:bg-secondary",
                      selectedClassname
                    )}
                  >
                    <IconComponent size={16} />
                    <p className="text-sm">{item.label}</p>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
