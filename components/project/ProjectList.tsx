"use client";

import React, { useState } from "react";
import { useProjects } from "@/hooks/useProject";
import ProjectCard from "./ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import SearchBar from "@/components/searchbar";

const ProjectList = () => {
  const { data: projects, isLoading } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects?.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-64" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchBar
        placeholder="Search projects..."
        containerClassName="w-full"
        value={searchQuery}
        onChange={handleSearch}
        onClear={handleClearSearch}
      />
      
      {filteredProjects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? "No projects found matching your search." : "No projects yet. Create your first project to get started."}
        </div>
      ) : (
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
