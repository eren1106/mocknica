'use client'

import React, { useState } from "react";
import DialogButton from "../dialog-button";
import { Plus } from "lucide-react";
import EndpointsList from "./EndpointList";
import { useProject } from "@/hooks/useProject";
import { Skeleton } from "../ui/skeleton";
import EndpointCreationTabs from "./EndpointCreationTabs";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";
import ControlsBar, { SortOption, FilterOption } from "../controls-bar";

type SortOrder = "name-asc" | "name-desc" | "created-asc" | "created-desc" | "method-asc" | "path-asc";
type FilterType = "all" | "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const EndpointPageContainer = () => {
  const projectId = useCurrentProjectId();
  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  
  // const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortOrder, setSortOrder] = useState<SortOrder>("created-desc");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300";
      case "POST": return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-300";
      case "PUT": return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300";
      case "DELETE": return "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-300";
      case "PATCH": return "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300";
      default: return "bg-gray-50 text-gray-700 dark:bg-gray-950/20 dark:text-gray-300";
    }
  };

  const sortOptions: SortOption[] = [
    { value: "created-desc", label: "Newest First" },
    { value: "created-asc", label: "Oldest First" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
    { value: "method-asc", label: "Method A-Z" },
    { value: "path-asc", label: "Path A-Z" },
  ];

  const filterOptions: FilterOption[] = [
    { value: "all", label: "All Methods" },
    { 
      value: "GET", 
      label: "GET Only",
      badge: { text: "GET", className: getMethodColor("GET") }
    },
    { 
      value: "POST", 
      label: "POST Only",
      badge: { text: "POST", className: getMethodColor("POST") }
    },
    { 
      value: "PUT", 
      label: "PUT Only",
      badge: { text: "PUT", className: getMethodColor("PUT") }
    },
    { 
      value: "DELETE", 
      label: "DELETE Only",
      badge: { text: "DELETE", className: getMethodColor("DELETE") }
    },
    { 
      value: "PATCH", 
      label: "PATCH Only",
      badge: { text: "PATCH", className: getMethodColor("PATCH") }
    },
  ];

  if (isLoadingProject) {
    return <Skeleton className="h-96" />;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">API Endpoints</h1>
          <p className="text-muted-foreground">
            Manage and test your API endpoints. Create, edit, and organize endpoints for {project.name}.
          </p>
        </div>
        
        <DialogButton
          content={(close) => <EndpointCreationTabs onSuccess={close} />}
          className="w-fit self-start lg:self-center"
        >
          <Plus className="size-4 mr-2" />
          Create Endpoint
        </DialogButton>
      </div>

      {/* Controls Bar */}
      <ControlsBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search endpoints..."
        sortValue={sortOrder}
        onSortChange={(value) => setSortOrder(value as SortOrder)}
        sortOptions={sortOptions}
        filterValue={filterType}
        onFilterChange={(value) => setFilterType(value as FilterType)}
        filterOptions={filterOptions}
      />

      {/* Endpoints List */}
      <EndpointsList 
        searchQuery={searchQuery}
        sortOrder={sortOrder}
        filterType={filterType}
      />
    </div>
  );
};

export default EndpointPageContainer;
