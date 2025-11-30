"use client";

import { useZodForm } from "@/hooks/useZodForm";
import { EHttpMethod } from "@/types";
import { toast } from "sonner";
import FormButton from "../form-button";
import GenericFormField from "../generic-form-field";
import ZodForm from "../zod-form";
import { Button } from "../ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import DialogButton from "../dialog-button";
import AutoResizeTextarea from "../auto-resize-textarea";
import { useMemo, useState, useEffect, useRef } from "react";
import JsonEditor from "../json-editor";
import { Switch } from "../ui/switch";
import { useResponseWrappers } from "@/hooks/useResponseWrapper";
import { Label } from "../ui/label";
import ResponseWrapperView from "@/app/(main)/projects/[id]/response-wrappers/_ui/ResponseWrapperView";
import { useMutationEndpoint } from "@/hooks/useEndpoint";
import { useSchemas } from "@/hooks/useSchema";
import { AIService } from "@/services/ai.service";
import {
  EndPointSchema,
  EndPointSchemaType,
} from "@/zod-schemas/endpoint.schema";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";
import { SchemaService } from "@/services/schema.service";
import { cn, stringifyJSON } from "@/lib/utils";
import JsonViewer from "../json-viewer";
import { ModelSelector } from "../model-selector";
import { IEndpoint } from "@/types";
import { LinkButton } from "../link-button";

interface EndpointFormProps {
  endpoint?: IEndpoint;
  onSuccess?: () => void;
}

export default function EndpointForm({
  endpoint,
  onSuccess,
}: EndpointFormProps) {
  const {
    createEndpoint,
    updateEndpoint,
    isPending: isMutatingEndpoint,
  } = useMutationEndpoint();
  const projectId = useCurrentProjectId();

  const { data: schemas, isLoading: isLoadingSchema } = useSchemas(projectId);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUseWrapper, setIsUseWrapper] = useState(
    !!endpoint?.responseWrapperId
  );
  const [isUseSchema, setIsUseSchema] = useState(!!endpoint?.schemaId);

  // Track the initial schemaId to prevent auto-regeneration on mount
  const initialSchemaIdRef = useRef(endpoint?.schemaId);
  const initialIsDataListRef = useRef(endpoint?.isDataList);
  const initialNumberOfDataRef = useRef(endpoint?.numberOfData);

  const { data: responseWrappers, isLoading: isLoadingResponseWrapper } =
    useResponseWrappers(projectId);

  const form = useZodForm(
    EndPointSchema,
    endpoint
      ? {
          ...endpoint,
          schemaId: endpoint.schemaId || undefined,
          responseWrapperId: endpoint.responseWrapperId || undefined,
          numberOfData: endpoint.numberOfData || 3,
          staticResponse: endpoint.staticResponse
            ? stringifyJSON(endpoint.staticResponse)
            : "",
          projectId: endpoint.projectId,
        }
      : {
          description: "",
          path: "",
          method: EHttpMethod.GET,
          isDataList: false,
          numberOfData: 3,
          staticResponse: stringifyJSON({
            id: 1,
            name: "John Doe",
          }),
          schemaId: undefined,
          responseWrapperId: undefined,
          projectId: projectId || "",
        }
  );

  const schemaId = form.watch("schemaId");
  const isDataList = form.watch("isDataList");
  const numberOfData = form.watch("numberOfData");

  // Auto-generate response when schema settings change
  // Only regenerate if values actually changed from initial state
  useEffect(() => {
    // Skip if this is the initial state (editing existing endpoint)
    const hasSchemaChanged = schemaId !== initialSchemaIdRef.current;
    const hasIsDataListChanged = isDataList !== initialIsDataListRef.current;
    const hasNumberOfDataChanged =
      numberOfData !== initialNumberOfDataRef.current;

    // Only regenerate if something actually changed AND we're using schema
    if (
      isUseSchema &&
      schemaId &&
      schemas &&
      (hasSchemaChanged || hasIsDataListChanged || hasNumberOfDataChanged)
    ) {
      handleRegenerateSchemaResponse();
    }
  }, [schemaId, isDataList, numberOfData, isUseSchema, schemas]);

  const onSubmit = async (values: EndPointSchemaType) => {
    console.log("VALUES", values);
    try {
      // Parse staticResponse safely since validation ensures it's valid JSON
      let parsedStaticResponse;
      if (values.staticResponse && values.staticResponse.trim() !== "") {
        parsedStaticResponse = JSON.parse(values.staticResponse);
      }

      // TODO: fix fields order not same after parse
      if (endpoint) {
        await updateEndpoint({
          id: endpoint.id,
          data: {
            ...values,
            description: values.description || undefined,
            // cannot send stringified format, need send in object format, because the stringify process will be conducted automatically when send data via api
            staticResponse: parsedStaticResponse,
          },
        });
      } else {
        await createEndpoint({
          ...values,
          description: values.description || undefined,
          // cannot send stringified format, need send in object format, because the stringify process will be conducted automatically when send data via api
          staticResponse: parsedStaticResponse,
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error creating endpoint:", error);
      toast.error(`Failed to ${endpoint ? "update" : "create"} endpoint`);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiPrompt(e.target.value);
  };

  const handleGenerateResponseByAI = async (callback: () => void) => {
    setIsGenerating(true);
    try {
      const res = await AIService.generateResponseByAI(
        aiPrompt,
        selectedModel || undefined
      );
      form.setValue("staticResponse", stringifyJSON(res));
    } catch (error) {
      console.error("Error generating response:", error);
      toast.error("Failed to generate response");
    } finally {
      setIsGenerating(false);
      callback();
    }
  };

  const handleUseSchemaChange = (checked: boolean) => {
    if (checked) {
      form.setValue(
        "schemaId",
        endpoint?.schemaId || defaultSchemaId || undefined
      );
      // Response will be auto-generated by useEffect when schemaId changes
    }
    if (!checked) {
      form.setValue("schemaId", undefined);
      // Reset to default static response when disabling schema
      form.setValue(
        "staticResponse",
        stringifyJSON(
          endpoint?.staticResponse || {
            id: 1,
            name: "John Doe",
          }
        )
      );
    }
    setIsUseSchema(checked);
  };

  const handleRegenerateSchemaResponse = async (showToast = false) => {
    if (schemaId && schemas) {
      const selectedSchema = schemas.find(
        (schema) => schema.id === Number(schemaId)
      );
      if (selectedSchema) {
        try {
          const isDataList = form.watch("isDataList");
          const numberOfData = form.watch("numberOfData");
          const generatedResponse = SchemaService.generateResponseFromSchema(
            selectedSchema,
            isDataList || false,
            numberOfData || undefined
          );
          form.setValue("staticResponse", stringifyJSON(generatedResponse));
          if (showToast) {
            toast.success("Schema response regenerated");
          }
        } catch (error) {
          console.error("Error regenerating schema response:", error);
          toast.error("Failed to regenerate schema response");
        }
      }
    }
  };

  const handleUseWrapperChange = (checked: boolean) => {
    if (checked) {
      form.setValue(
        "responseWrapperId",
        endpoint?.responseWrapperId || defaultWrapperId || undefined
      );
    }
    if (!checked) {
      form.setValue("responseWrapperId", undefined);
    }
    setIsUseWrapper(checked);
  };

  const defaultSchemaId = useMemo(() => {
    if ((endpoint && endpoint.schemaId) || schemas?.length === 0)
      return undefined;
    return schemas?.[0].id;
  }, [schemas, endpoint]);

  const defaultWrapperId = useMemo(() => {
    if (
      (endpoint && endpoint.responseWrapperId) ||
      responseWrappers?.length === 0
    )
      return undefined;
    return responseWrappers?.[0].id;
  }, [responseWrappers, endpoint]);

  const responseWrapperId = form.watch("responseWrapperId");
  const selectedWrapper = useMemo(() => {
    if (!responseWrapperId) return undefined;
    return responseWrappers?.find(
      (wrapper) => wrapper.id === Number(responseWrapperId)
    );
  }, [responseWrapperId, responseWrappers]);

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <ZodForm
      form={form}
      onSubmit={onSubmit}
      className="w-full sm:min-w-[40rem]"
    >
      <GenericFormField
        control={form.control}
        type="input"
        name="description"
        label="Description"
        placeholder="API endpoint description"
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-32">
          <GenericFormField
            control={form.control}
            type="select"
            name="method"
            label="Method"
            options={[
              { value: "GET", label: "GET" },
              { value: "POST", label: "POST" },
              { value: "PUT", label: "PUT" },
              { value: "DELETE", label: "DELETE" },
              { value: "PATCH", label: "PATCH" },
            ]}
          />
        </div>

        <div className="flex-1">
          <GenericFormField
            control={form.control}
            type="input"
            name="path"
            label="Path"
            placeholder="/users"
          />
        </div>
      </div>

      {/* SCHEMA */}
      <div className="flex items-center gap-2">
        <Switch checked={isUseSchema} onCheckedChange={handleUseSchemaChange} />
        <Label htmlFor="use-wrapper">Use Schema</Label>
      </div>

      {isUseSchema && (
        <>
          {isLoadingSchema ? (
            <div className="flex flex-col gap-3">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
          ) : schemas && schemas.length > 0 ? (
            <>
              <GenericFormField
                control={form.control}
                type="select"
                name="schemaId"
                label="Schema"
                placeholder="Select schema"
                options={
                  schemas?.map((schema) => ({
                    value: schema.id.toString(),
                    label: schema.name,
                  })) || []
                }
                defaultValue={defaultSchemaId?.toString()}
                disabled={isLoadingSchema}
              />
              <GenericFormField
                control={form.control}
                type="switch"
                name="isDataList"
                label="Is Data List"
                className="flex-row-reverse items-center w-auto justify-end"
                contentClassName="items-center w-auto"
                optional
              />
              {form.watch("isDataList") && (
                <GenericFormField
                  control={form.control}
                  type="number"
                  name="numberOfData"
                  label="Number of Data"
                  placeholder="Number of data"
                  optional
                  description="Number of data to generate, if not set, it will generate 3 data"
                />
              )}

              {schemaId && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Schema Response Preview
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerateSchemaResponse(true)}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw size={14} />
                      Regenerate
                    </Button>
                  </div>
                  <JsonViewer
                    data={(() => {
                      try {
                        const staticResponse =
                          form.watch("staticResponse") || "{}";
                        return staticResponse.trim()
                          ? JSON.parse(staticResponse)
                          : {};
                      } catch (error) {
                        console.error("Error parsing staticResponse:", error);
                        return {};
                      }
                    })()}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-3 p-4 border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">
                No schemas available for this project. Create a schema first to
                use dynamic data generation.
              </p>
              <LinkButton
                href={`/projects/${projectId}/schemas`}
                variant="outline"
                className="w-fit"
              >
                Go to Schemas
              </LinkButton>
            </div>
          )}
        </>
      )}

      {!isUseSchema && (
        <GenericFormField
          control={form.control}
          type="custom"
          name="staticResponse"
          label="Static Response (JSON)"
          customChildren={
            <JsonEditor
              value={form.watch("staticResponse") || ""}
              onChange={(value) => form.setValue("staticResponse", value)}
            />
          }
          topEndContent={
            <DialogButton
              variant="secondary"
              size="sm"
              className={cn(
                "flex items-center gap-2 rounded-full",
                "bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 text-white hover:from-purple-600 hover:to-blue-600 dark:hover:from-purple-700 dark:hover:to-blue-700"
              )}
              title="Generate Response with AI"
              description="Describe the response you want to generate"
              content={(close) => (
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">AI Model</label>
                    <ModelSelector
                      value={selectedModel}
                      onValueChange={setSelectedModel}
                      placeholder="Select AI model"
                    />
                    <p className="text-xs text-muted-foreground">
                      Choose an AI model for generation. If not selected, the
                      default model will be used.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Response Description
                    </label>
                    <AutoResizeTextarea
                      placeholder="Generate a user profile response with fields for id, name, email, role, and status"
                      minRows={5}
                      value={aiPrompt}
                      onChange={handlePromptChange}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => close()}
                      disabled={isGenerating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleGenerateResponseByAI(close)}
                      disabled={isGenerating || !aiPrompt.trim()}
                    >
                      {isGenerating ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                </div>
              )}
            >
              <Sparkles size={16} />
              Generate with AI
            </DialogButton>
          }
        />
      )}

      {/* RESPONSE WRAPPER */}
      <div className="flex items-center gap-2">
        <Switch
          checked={isUseWrapper}
          onCheckedChange={handleUseWrapperChange}
        />
        <Label htmlFor="use-wrapper">Use Response Wrapper</Label>
      </div>
      {isUseWrapper && (
        <GenericFormField
          control={form.control}
          type="select"
          name="responseWrapperId"
          label="Response Wrapper"
          placeholder="Select response wrapper"
          options={
            responseWrappers?.map((wrapper) => ({
              value: wrapper.id.toString(),
              label: wrapper.name,
            })) || []
          }
          emptyOptionsFallback={
            <div className="flex flex-col gap-2 p-2 max-w-full">
              <p className="text-sm text-muted-foreground leading-tight">
                No response wrappers available. Create one first.
              </p>
              <LinkButton
                href={`/projects/${projectId}/response-wrappers`}
                size="sm"
              >
                Go to Response Wrappers
              </LinkButton>
            </div>
          }
          defaultValue={defaultWrapperId?.toString()}
          disabled={isLoadingResponseWrapper}
        />
      )}
      {isUseWrapper && selectedWrapper && (
        <ResponseWrapperView wrapper={selectedWrapper} />
      )}

      <FormButton isLoading={isMutatingEndpoint}>
        {endpoint ? "Update" : "Create"} Endpoint
      </FormButton>
    </ZodForm>
  );
}
