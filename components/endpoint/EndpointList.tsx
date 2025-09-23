"use client";

import React from "react";
import { Accordion } from "../ui/accordion";
import { useEndpoints } from "@/hooks/useEndpoint";
import { Skeleton } from "../ui/skeleton";
import EndpointItem from "./EndpointItem";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";
import { Globe } from "lucide-react";

type SortOrder = "name-asc" | "name-desc" | "created-asc" | "created-desc" | "method-asc" | "path-asc";
type FilterType = "all" | "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface EndpointsListProps {
  searchQuery?: string;
  sortOrder?: SortOrder;
  filterType?: FilterType;
}

export default function EndpointsList({ 
  searchQuery = "",
  sortOrder = "created-desc",
  filterType = "all",
}: EndpointsListProps) {
  const projectId = useCurrentProjectId();

  const { data: endpoints, isLoading: isLoadingEndpoints } =
    useEndpoints(projectId);

  const filteredAndSortedEndpoints = React.useMemo(() => {
    if (!endpoints) return [];

    const filtered = endpoints.filter((endpoint) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Method filter
      const matchesFilter = filterType === "all" || endpoint.method === filterType;

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

  if (isLoadingEndpoints) {
    return (
      // TODO: make this into reusable component
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="w-full h-40" />
        ))}
      </div>
    );
  }

  // TODO: make it into reusable component
  // empty fallback
  if (filteredAndSortedEndpoints.length === 0) {
    return (
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
    );
  }

  return (
    <div>
      <Accordion type="multiple" className="w-full flex flex-col gap-1">
        {filteredAndSortedEndpoints.map((endpoint) => (
          <EndpointItem key={endpoint.id} endpoint={endpoint} />
        ))}
      </Accordion>
    </div>
  );
}
