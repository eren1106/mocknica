"use client";

import React, { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SchemaCard from "./SchemaCard";
import { Database } from "lucide-react";
import { useSchemas } from "@/hooks/useSchema";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";
import ControlsBar, { SortOption } from "@/components/controls-bar";

type SortOrder = "name-asc" | "name-desc" | "created-asc" | "created-desc" | "fields-asc" | "fields-desc";

const SchemasList = () => {
  const projectId = useCurrentProjectId();
  const { data: schemas, isLoading } = useSchemas(projectId);
  
  const [sortOrder, setSortOrder] = useState<SortOrder>("created-desc");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndSortedSchemas = useMemo(() => {
    if (!schemas) return [];

    const filtered = schemas.filter((schema) => {
      return schema.name.toLowerCase().includes(searchQuery.toLowerCase());
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
        case "fields-asc":
          return (a.fields?.length || 0) - (b.fields?.length || 0);
        case "fields-desc":
          return (b.fields?.length || 0) - (a.fields?.length || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [schemas, searchQuery, sortOrder]);

  const sortOptions: SortOption[] = [
    { value: "created-desc", label: "Newest First" },
    { value: "created-asc", label: "Oldest First" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
    { value: "fields-desc", label: "Most Fields" },
    { value: "fields-asc", label: "Fewest Fields" },
  ];

  return (
    <>
      <ControlsBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search schemas..."
        sortValue={sortOrder}
        onSortChange={(value) => setSortOrder(value as SortOrder)}
        sortOptions={sortOptions}
      />
      
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      ) : filteredAndSortedSchemas.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Database className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? "No schemas found" : "No schemas yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "Try adjusting your search criteria"
              : "Create your first data schema to define the structure of your API responses"
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedSchemas.map((schema) => (
            <SchemaCard key={schema.id} schema={schema} />
          ))}
        </div>
      )}
    </>
  );
};

export default SchemasList;
