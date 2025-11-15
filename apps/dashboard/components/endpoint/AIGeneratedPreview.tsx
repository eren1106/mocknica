"use client";

import React, { useMemo } from "react";
import {
  Database,
  Code,
  Eye,
  X,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ISchema, IEndpoint, EHttpMethod } from "@/types";
import { AIGeneratedData, aiGeneratedDataAtom } from "@/atoms/aiGenerationAtom";
import MyTooltip from "@/components/my-tooltip";
import JsonViewer from "@/components/json-viewer";
import { SchemaService } from "@/services/schema.service";
import { useAtom } from "jotai";

interface AIGeneratedPreviewProps {
  data: AIGeneratedData;
  existingSchemas?: ISchema[];
  existingEndpoints?: IEndpoint[];
  onUpdateData?: (data: AIGeneratedData) => void;
  onCreateAll?: () => void;
  onCancel?: () => void;
  isCreatingAll?: boolean;
}

const getMethodColor = (method: string) => {
  switch (method) {
    case "GET":
      return "border-green-500 text-green-700 dark:text-green-400";
    case "POST":
      return "border-blue-500 text-blue-700 dark:text-blue-400";
    case "PUT":
    case "PATCH":
      return "border-orange-500 text-orange-700 dark:text-orange-400";
    case "DELETE":
      return "border-red-500 text-red-700 dark:text-red-400";
    default:
      return "border-gray-500 text-gray-700 dark:text-gray-400";
  }
};

export default function AIGeneratedPreview({
  existingSchemas = [],
  existingEndpoints = [],
  onUpdateData,
  onCreateAll,
  onCancel,
  isCreatingAll = false,
}: AIGeneratedPreviewProps) {

   const [aiGeneratedData, setAiGeneratedData] = useAtom(aiGeneratedDataAtom);

  // Check for duplicates
  const isDuplicateSchema = (schemaName: string) => {
    return existingSchemas.some(
      (existing) => existing.name.toLowerCase() === schemaName.toLowerCase()
    );
  };

  const isDuplicateEndpoint = (path: string, method: EHttpMethod) => {
    return existingEndpoints.some(
      (existing) => existing.path === path && existing.method === method
    );
  };

  // Generate endpoint response for tooltip preview
  const generateEndpointResponse = useMemo(() => {
    return (endpoint: IEndpoint, linkedSchema: ISchema | null | undefined) => {
      if (linkedSchema) {
        // Generate response from schema (AIGeneratedSchema has same fields structure as ISchema)
        const generated = SchemaService.generateResponseFromSchema(
          linkedSchema,
          endpoint.isDataList ?? false,
          endpoint.numberOfData ?? undefined
        );

        return generated;
      } else {
        // Use static response
        return endpoint.staticResponse;
      }
    };
  }, []);

  const handleDeleteSchema = (schemaIndex: number) => {
    const updatedSchemas = aiGeneratedData?.schemas?.filter((_, idx) => idx !== schemaIndex);

    // Remove endpoints that reference this schema (1-based index)
    const schemaId = schemaIndex + 1;
    const updatedEndpoints = aiGeneratedData?.endpoints?.filter(
      (endpoint) => endpoint.schemaId !== schemaId
    );

    // Adjust schemaId references for remaining endpoints
    const adjustedEndpoints = updatedEndpoints?.map((endpoint) => {
      if (endpoint.schemaId && endpoint.schemaId > schemaId) {
        return { ...endpoint, schemaId: endpoint.schemaId - 1 };
      }
      return endpoint;
    });

    onUpdateData?.({
      schemas: updatedSchemas ?? [],
      endpoints: adjustedEndpoints ?? [],
    });
  };

  const handleDeleteEndpoint = (endpointIndex: number) => {
    const updatedEndpoints = aiGeneratedData?.endpoints?.filter(
      (_, idx) => idx !== endpointIndex
    );

    onUpdateData?.({
      schemas: aiGeneratedData?.schemas ?? [],
      endpoints: updatedEndpoints ?? [],
    });
  };

  const duplicateSchemaCount = aiGeneratedData?.schemas?.filter((s) =>
    isDuplicateSchema(s.name)
  ).length ?? 0;
  const duplicateEndpointCount = aiGeneratedData?.endpoints?.filter((e) =>
    isDuplicateEndpoint(e.path, e.method)
  ).length ?? 0;

  return (
    <div className="my-4">
      <Card className="flex flex-col gap-4 overflow-hidden border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-b border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                  AI Generated Structure
                </h3>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                  {aiGeneratedData?.schemas?.length} schema(s) • {aiGeneratedData?.endpoints?.length}{" "}
                  endpoint(s)
                </p>
              </div>
            </div>

            {/* <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                className="h-8 text-purple-700 hover:text-purple-900 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                title="Regenerate with different prompt"
              >
                <RefreshCw className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                className="h-8 text-purple-700 hover:text-purple-900 hover:bg-purple-100 dark:hover:bg-purple-900/20"
              >
                {isExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 text-purple-700 hover:text-purple-900 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                title="Remove AI generated data"
              >
                <X className="size-4" />
              </Button>
            </div> */}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Schemas Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-purple-200 dark:border-purple-800">
              <Database className="size-4 text-blue-600" />
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                Schemas ({aiGeneratedData?.schemas?.length})
              </h4>
            </div>

            {aiGeneratedData?.schemas?.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Database className="size-8 mx-auto mb-2 opacity-50" />
                No schemas generated
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {aiGeneratedData?.schemas?.map((schema, index) => {
                  const isDuplicate = isDuplicateSchema(schema.name);
                  return (
                    <Card
                      key={index}
                      className={`p-3 bg-white/80 dark:bg-gray-800/80 border hover:shadow-md transition-shadow ${
                        isDuplicate
                          ? "border-orange-300 dark:border-orange-700 opacity-60"
                          : "border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start sm:items-center justify-between gap-2">
                          <h5 className="font-semibold text-sm text-blue-900 dark:text-blue-100 flex-1 min-w-0">
                            {schema.name}
                          </h5>
                          <div className="flex gap-1 flex-shrink-0">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-100 dark:bg-blue-900"
                            >
                              {schema.fields?.length} fields
                            </Badge>
                            {isDuplicate && (
                              <Badge
                                variant="outline"
                                className="text-xs border-orange-500 text-orange-700 dark:text-orange-400"
                              >
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Exists
                              </Badge>
                            )}
                            {onUpdateData && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSchema(index)}
                                className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                                title="Remove this schema and its endpoints"
                              >
                                <X className="h-3 w-3 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {"description" in schema &&
                          (schema as any).description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {(schema as any).description}
                            </p>
                          )}
                        {(() => {
                          const fields = schema.fields || [];
                          return fields.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {fields.map((field, fieldIndex) => (
                              <Badge
                                key={fieldIndex}
                                variant="outline"
                                className="text-xs px-2 py-0.5 h-6 font-mono"
                              >
                                {field.name}
                              </Badge>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Endpoints Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-purple-200 dark:border-purple-800">
              <Code className="size-4 text-purple-600" />
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                Endpoints ({aiGeneratedData?.endpoints?.length})
              </h4>
            </div>

            {aiGeneratedData?.endpoints?.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Code className="size-8 mx-auto mb-2 opacity-50" />
                No endpoints generated
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {aiGeneratedData?.endpoints?.map((endpoint, index) => {
                  const isDuplicate = isDuplicateEndpoint(
                    endpoint.path,
                    endpoint.method
                  );
                  const linkedSchema = endpoint.schemaId
                    ? aiGeneratedData?.schemas?.[endpoint.schemaId - 1]
                    : null;
                  const endpointResponse = generateEndpointResponse(
                    endpoint,
                    linkedSchema
                  );

                  return (
                    <MyTooltip
                      key={index}
                      className="bg-background"
                      content={
                        <div className="max-w-md text-foreground">
                          <p className="text-xs font-semibold mb-2">
                            Response Preview:
                          </p>
                          <JsonViewer data={endpointResponse} />
                        </div>
                      }
                      delayDuration={300}
                      asChild
                    >
                      <Card
                        className={`p-3 bg-white/80 dark:bg-gray-800/80 border hover:shadow-md transition-shadow cursor-help ${
                          isDuplicate
                            ? "border-orange-300 dark:border-orange-700 opacity-60"
                            : "border-purple-600"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                              <Badge
                                variant="outline"
                                className={`text-xs font-mono font-semibold flex-shrink-0 ${getMethodColor(
                                  endpoint.method
                                )}`}
                              >
                                {endpoint.method}
                              </Badge>
                              <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all flex-1">
                                {endpoint.path}
                              </code>
                              {isDuplicate && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-orange-500 text-orange-700 dark:text-orange-400 flex-shrink-0"
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Exists
                                </Badge>
                              )}
                            </div>
                            {onUpdateData && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEndpoint(index)}
                                className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 flex-shrink-0"
                                title="Remove this endpoint"
                              >
                                <X className="h-3 w-3 text-red-600" />
                              </Button>
                            )}
                          </div>
                          {endpoint.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {endpoint.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            {linkedSchema && (
                              <div className="flex items-center gap-1">
                                <Database className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                  {linkedSchema.name}
                                </span>
                              </div>
                            )}
                            {endpoint.isDataList && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                <span className="text-xs text-gray-500">
                                  Returns {endpoint.numberOfData || "multiple"}{" "}
                                  items
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </MyTooltip>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Info Footer */}
        {(duplicateSchemaCount > 0 || duplicateEndpointCount > 0) ? (
          <div className="mt-4 border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/20 border p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="size-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">
                  Duplicates Detected
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  {duplicateSchemaCount > 0 && (
                    <>
                      {duplicateSchemaCount} schema(s) already exist and will be
                      skipped.
                    </>
                  )}
                  {duplicateSchemaCount > 0 && duplicateEndpointCount > 0 && (
                    <> </>
                  )}
                  {duplicateEndpointCount > 0 && (
                    <>
                      {duplicateEndpointCount} endpoint(s) already exist and
                      will be skipped.
                    </>
                  )}{" "}
                  Only new items will be created.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 border-purple-300 dark:border-purple-700 bg-white/50 dark:bg-gray-900/50 border p-4 rounded-lg flex items-center gap-2">
            <Sparkles className="size-4" />
            <p className="text-xs text-purple-700 dark:text-purple-300">
              These schemas and endpoints will be created when you click "Create
              All". You can regenerate or remove them before creating.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {(onCreateAll || onCancel) && (
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button
                variant="outline"
                size="default"
                onClick={onCancel}
                disabled={isCreatingAll}
              >
                Cancel
              </Button>
            )}
            {onCreateAll && (
              <Button
                variant="default"
                size="default"
                className="bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 text-white hover:from-purple-600 hover:to-blue-600 dark:hover:from-purple-700 dark:hover:to-blue-700"
                onClick={onCreateAll}
                disabled={isCreatingAll}
              >
                {isCreatingAll ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    Create
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
