"use client";

import React, { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DialogButton from "@/components/dialog-button";
import ResponseWrapperForm from "./ResponseWrapperForm";
import { Plus, Package } from "lucide-react";
import { useResponseWrappers } from "@/hooks/useResponseWrapper";
import ResponseWrapperCard from "./ResponseWrapperCard";
import ControlsBar, { SortOption } from "@/components/controls-bar";

interface ResponseWrappersPageContainerProps {
  projectId: string;
}

type SortOrder = "name-asc" | "name-desc" | "created-asc" | "created-desc";

const ResponseWrappersPageContainer = ({ projectId }: ResponseWrappersPageContainerProps) => {
  const { data: responseWrappers, isLoading } = useResponseWrappers(projectId);
  
  const [sortOrder, setSortOrder] = useState<SortOrder>("created-desc");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndSortedWrappers = useMemo(() => {
    if (!responseWrappers) return [];

    const filtered = responseWrappers.filter((wrapper) => {
      return wrapper.name.toLowerCase().includes(searchQuery.toLowerCase());
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
        default:
          return 0;
      }
    });

    return filtered;
  }, [responseWrappers, searchQuery, sortOrder]);

  const sortOptions: SortOption[] = [
    { value: "created-desc", label: "Newest First" },
    { value: "created-asc", label: "Oldest First" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Response Wrappers</h1>
          <p className="text-muted-foreground">
            Create consistent response formats for your API endpoints. Standardize how data, metadata, and pagination are structured in your responses.
          </p>
        </div>
        
        <DialogButton
          content={(close) => <ResponseWrapperForm onSuccess={close} />}
          className="w-fit self-start lg:self-center"
          contentClassName="min-w-[40rem]"
          title="Create Response Wrapper"
          description="Create a new response wrapper"
        >
          <Plus className="size-4 mr-2" />
          Create Response Wrapper
        </DialogButton>
      </div>

      {/* Controls Bar */}
      <ControlsBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search response wrappers..."
        sortValue={sortOrder}
        onSortChange={(value) => setSortOrder(value as SortOrder)}
        sortOptions={sortOptions}
      />

      {/* Response Wrappers Grid */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      ) : filteredAndSortedWrappers.length === 0 ? (
        // empty fallback
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Package className="size-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? "No response wrappers found" : "No response wrappers yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "Try adjusting your search criteria"
              : "Create your first response wrapper to standardize your API response formats"
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedWrappers.map((wrapper) => (
            <ResponseWrapperCard
              key={wrapper.id}
              wrapper={wrapper}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponseWrappersPageContainer;