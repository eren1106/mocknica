"use client";

import React, { useState } from "react";
import { Accordion } from "../ui/accordion";
import { useEndpoints, useMutationEndpoint } from "@/hooks/useEndpoint";
import { useSchemas } from "@/hooks/useSchema";
import { Skeleton } from "../ui/skeleton";
import EndpointItem from "./EndpointItem";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";
import { Globe } from "lucide-react";
import ControlsBar, { SortOption, FilterOption } from "../controls-bar";
import AIGeneratedPreview from "./AIGeneratedPreview";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { aiGeneratedDataAtom } from "@/atoms/aiGenerationAtom";

type SortOrder = "description-asc" | "description-desc" | "created-asc" | "created-desc" | "method-asc" | "path-asc";
type FilterType = "all" | "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export default function EndpointsList() {
  const projectId = useCurrentProjectId();
  const { data: endpoints, isLoading: isLoadingEndpoints } = useEndpoints(projectId);
  // TODO: use isLoadingSchemas and isPendingBulk
  const { data: schemas, isLoading: isLoadingSchemas } = useSchemas(projectId);
  const { createBulkEndpoints, isPending: isPendingBulk } = useMutationEndpoint();
  
  const [sortOrder, setSortOrder] = useState<SortOrder>("created-desc");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiGeneratedData, setAiGeneratedData] = useAtom(aiGeneratedDataAtom);
  const [isCreatingAll, setIsCreatingAll] = useState(false);

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

  const handleRemoveAI = () => {
    setAiGeneratedData(null);
  };

  const handleCreateAll = async () => {
    if (!aiGeneratedData || !projectId) return;

    setIsCreatingAll(true);
    try {
      const createdSchemas: Array<{ id: number; name: string }> = [];
      const skippedSchemas: string[] = [];
      const skippedEndpoints: string[] = [];

      // Get existing schemas and endpoints for duplicate checking
      const existingSchemas = schemas || [];
      const existingEndpoints = endpoints || [];

      // Prepare schemas to create (filter out duplicates)
      const schemasToCreate = aiGeneratedData.schemas.filter((schemaData) => {
        const isDuplicate = existingSchemas.some(
          (existing) => existing.name.toLowerCase() === schemaData.name.toLowerCase()
        );
        if (isDuplicate) {
          skippedSchemas.push(schemaData.name);
          // Add existing schema to createdSchemas for endpoint reference
          const existingSchema = existingSchemas.find(
            (s) => s.name.toLowerCase() === schemaData.name.toLowerCase()
          );
          if (existingSchema) {
            createdSchemas.push({ id: existingSchema.id, name: existingSchema.name });
          }
          return false;
        }
        return true;
      });

      // Prepare endpoints to create (filter out duplicates)
      const endpointsToCreate = aiGeneratedData.endpoints.filter((endpointData) => {
        const isDuplicate = existingEndpoints.some(
          (existing) =>
            existing.path === endpointData.path &&
            existing.method === endpointData.method
        );
        if (isDuplicate) {
          skippedEndpoints.push(`${endpointData.method} ${endpointData.path}`);
          return false;
        }
        return true;
      });

      // Create schemas and endpoints in one API call
      const result = await createBulkEndpoints({
        projectId,
        schemas: schemasToCreate.map((s) => ({
          name: s.name,
          fields: s.fields,
        })),
        endpoints: endpointsToCreate.map((endpointData) => {
          // CRITICAL FIX: Pass the AI's schemaId (1-based index) directly to backend
          // The backend will handle mapping it to actual database schema IDs
          return {
            path: endpointData.path,
            method: endpointData.method,
            description: endpointData.description,
            schemaId: endpointData.schemaId, // Keep the 1-based index from AI
            isDataList: endpointData.isDataList || false,
            numberOfData: endpointData.numberOfData,
            staticResponse: endpointData.staticResponse,
            projectId,
          };
        }),
      });

      // Build success message with details
      const createdSchemasCount = result.schemas.length;
      const createdEndpointsCount = result.endpoints.length;
      
      let message = `Successfully created ${createdSchemasCount} schema(s) and ${createdEndpointsCount} endpoint(s)`;
      
      if (skippedSchemas.length > 0 || skippedEndpoints.length > 0) {
        const skippedParts = [];
        if (skippedSchemas.length > 0) {
          skippedParts.push(`${skippedSchemas.length} schema(s)`);
        }
        if (skippedEndpoints.length > 0) {
          skippedParts.push(`${skippedEndpoints.length} endpoint(s)`);
        }
        message += `. Skipped ${skippedParts.join(" and ")} (already exist)`;
      }

      toast.success(message);
      setAiGeneratedData(null);
    } catch (error) {
      console.error("Error creating schemas and endpoints:", error);
      toast.error("Failed to create some items. Please check and try again.");
    } finally {
      setIsCreatingAll(false);
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

      {/* AI Generated Preview */}
      {aiGeneratedData && (
        <AIGeneratedPreview
          data={aiGeneratedData}
          existingSchemas={schemas || []}
          existingEndpoints={endpoints || []}
          onUpdateData={setAiGeneratedData}
          onCreateAll={handleCreateAll}
          onCancel={handleRemoveAI}
          isCreatingAll={isCreatingAll}
        />
      )}
      
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
