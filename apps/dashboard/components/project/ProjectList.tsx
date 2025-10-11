"use client";

import { useMemo, useState } from "react";
import { useProjects } from "@/hooks/useProject";
import ProjectCard from "./ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen } from "lucide-react";
import ControlsBar from "@/components/controls-bar";

type SortOrder = "name-asc" | "name-desc" | "created-asc" | "created-desc";

const ProjectList = () => {
  const { data: projects, isLoading } = useProjects();
  const [sortOrder, setSortOrder] = useState<SortOrder>("created-desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Sort options for ControlsBar
  const sortOptions = [
    { value: "created-desc", label: "Newest First" },
    { value: "created-asc", label: "Oldest First" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
  ];

  const filteredAndSortedProjects = useMemo(() => {
    if (!projects) return [];

    const filtered = projects.filter((project) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
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
  }, [projects, searchQuery, sortOrder]);

  return (
    <>
      <ControlsBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search projects..."
        sortValue={sortOrder}
        onSortChange={(value) => setSortOrder(value as SortOrder)}
        sortOptions={sortOptions}
      />

      {isLoading ? (
        <div className={`grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      ) : filteredAndSortedProjects.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="size-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery
              ? "No projects found"
              : "No projects yet"
            }
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search or filter criteria"
              : "Create your first project to get started with building your API"
            }
          </p>
        </div>
      ) : (
        <div className={`grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`}>
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ProjectList;
