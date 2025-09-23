"use client";

import { useMemo } from "react";
import { useProjects } from "@/hooks/useProject";
import ProjectCard from "./ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen } from "lucide-react";

type SortOrder = "name-asc" | "name-desc" | "created-asc" | "created-desc";
type FilterType = "all" | "public" | "private";

interface ProjectListProps {
  searchQuery?: string;
  sortOrder?: SortOrder;
  filterType?: FilterType;
}

const ProjectList = ({ 
  searchQuery = "",
  sortOrder = "created-desc",
  filterType = "all",
}: ProjectListProps) => {
  const { data: projects, isLoading } = useProjects();

  const filteredAndSortedProjects = useMemo(() => {
    if (!projects) return [];

    const filtered = projects.filter((project) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Visibility filter
      const matchesFilter = filterType === "all" || 
        (filterType === "public" && project.permission === "PUBLIC") ||
        (filterType === "private" && project.permission === "PRIVATE");

      return matchesSearch && matchesFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "created-asc":
          return new Date(a.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "created-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchQuery, sortOrder, filterType]);

  if (isLoading) {
    return (
      <div className={`grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-64" />
        ))}
      </div>
    );
  }

  if (filteredAndSortedProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="size-12 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          {searchQuery || filterType !== "all" 
            ? "No projects found"
            : "No projects yet"
          }
        </h3>
        <p className="text-muted-foreground mb-4">
          {searchQuery || filterType !== "all"
            ? "Try adjusting your search or filter criteria"
            : "Create your first project to get started with building your API"
          }
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`}>
      {filteredAndSortedProjects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project}
        />
      ))}
    </div>
  );
};

export default ProjectList;
