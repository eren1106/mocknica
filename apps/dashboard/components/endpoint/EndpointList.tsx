"use client";

import React, { useState } from "react";
import { Accordion } from "../ui/accordion";
import { useEndpoints } from "@/hooks/useEndpoint";
import { Skeleton } from "../ui/skeleton";
import EndpointItem from "./EndpointItem";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";
import { Globe } from "lucide-react";
import ControlsBar, { SortOption, FilterOption } from "../controls-bar";

type SortOrder = "description-asc" | "description-desc" | "created-asc" | "created-desc" | "method-asc" | "path-asc";
type FilterType = "all" | "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export default function EndpointsList() {
  const projectId = useCurrentProjectId();
  const { data: endpoints, isLoading: isLoadingEndpoints } = useEndpoints(projectId);
  
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
    { value: "description-asc", label: "Description A-Z" },
    { value: "description-desc", label: "Description Z-A" },
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

  const filteredAndSortedEndpoints = React.useMemo(() => {
    if (!endpoints) return [];

    const filtered = endpoints.filter((endpoint) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Method filter
      const matchesFilter = filterType === "all" || endpoint.method === filterType;

      return matchesSearch && matchesFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "description-asc":
          return a.description.localeCompare(b.description);
        case "description-desc":
          return b.description.localeCompare(a.description);
        case "created-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "created-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "method-asc":
          return a.method.localeCompare(b.method);
        case "path-asc":
          return a.path.localeCompare(b.path);
        default:
          return 0;
      }
    });

    return filtered;
  }, [endpoints, searchQuery, sortOrder, filterType]);

  return (
    <>
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
      
      {isLoadingEndpoints ? (
        // TODO: make this into reusable component
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-40" />
          ))}
        </div>
      ) : filteredAndSortedEndpoints.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Globe className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery || filterType !== "all" 
              ? "No endpoints found"
              : "No endpoints yet"
            }
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || filterType !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Create your first API endpoint to start building your mock API"
            }
          </p>
        </div>
      ) : (
        <div>
          <Accordion type="multiple" className="w-full flex flex-col gap-1">
            {filteredAndSortedEndpoints.map((endpoint) => (
              <EndpointItem key={endpoint.id} endpoint={endpoint} />
            ))}
          </Accordion>
        </div>
      )}
    </>
  );
}
