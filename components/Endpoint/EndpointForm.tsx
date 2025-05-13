"use client";

import { useEndpoint } from "@/hooks/useEndpoint";
import { useZodForm } from "@/hooks/useZodForm";
import { Endpoint, HttpMethod } from "@prisma/client";
import { toast } from "sonner";
import * as z from "zod";
import FormButton from "../form-button";
import GenericFormField from "../generic-form-field";
import ZodForm from "../zod-form";
import { Button } from "../ui/button";
import { Sparkles } from "lucide-react";
import DialogButton from "../dialog-button";
import AutoResizeTextarea from "../auto-resize-textarea";
import { useEffect, useMemo, useState } from "react";
import { EndpointService } from "@/services/endpoint.service";
import JsonEditor from "../json-editor";
import { Switch } from "../ui/switch";
import { useResponseWrapper } from "@/hooks/useResponseWrapper";
import { Skeleton } from "../ui/skeleton";
import { Label } from "../ui/label";
import ResponseWrapperView from "@/app/response-wrapper/_ui/ResponseWrapperView";
import { useSchema } from "@/hooks/useSchema";

const EndPointSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  method: z.nativeEnum(HttpMethod),
  path: z.string().min(1, "Path is required"),
  schemaId: z.coerce.number().nullable(),
  responseWrapperId: z.coerce.number().nullable(),
  staticResponse: z.string().nullable(),
});

interface EndpointFormProps {
  endpoint?: Endpoint;
  onSuccess?: () => void;
}

export default function EndpointForm({
  endpoint,
  onSuccess,
}: EndpointFormProps) {
  const { createEndpoint, updateEndpoint, isMutating } = useEndpoint();
  const { fetchSchemas, schemas, isLoading: isLoadingSchema } = useSchema();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUseWrapper, setIsUseWrapper] = useState(
    !!endpoint?.responseWrapperId
  );
  const [isUseSchema, setIsUseSchema] = useState(!!endpoint?.schemaId);
  const {
    fetchResponseWrappers,
    responseWrappers,
    isLoading: isLoadingResponseWrapper,
  } = useResponseWrapper();

  useEffect(() => {
    fetchSchemas();
    fetchResponseWrappers();
  }, []);

  const form = useZodForm(
    EndPointSchema,
    endpoint
      ? {
          ...endpoint,
          staticResponse: endpoint.staticResponse
            ? JSON.stringify(endpoint.staticResponse, null, 4)
            : "",
        }
      : {
          name: "",
          description: "",
          path: "",
          method: HttpMethod.GET,
          // responseGen: ResponseGeneration.STATIC,
          staticResponse: JSON.stringify(
            {
              id: 1,
              name: "John Doe",
            },
            null,
            4
          ),
        }
  );

  const onSubmit = async (values: z.infer<typeof EndPointSchema>) => {
    console.log("VALUES", values);
    try {
      // TODO: fix fields order not same after parse
      if (endpoint) {
        await updateEndpoint(endpoint.id, {
          ...values,
          // cannot send stringify format, need send in object format, because the stringify process will be conducted automatically when send data via api
          staticResponse: values.staticResponse
            ? JSON.parse(values.staticResponse)
            : undefined,
        });
      } else {
        await createEndpoint({
          ...values,
          // cannot send stringify format, need send in object format, because the stringify process will be conducted automatically when send data via api
          staticResponse: values.staticResponse
            ? JSON.parse(values.staticResponse)
            : undefined,
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
      const res = await EndpointService.generateResponseByAI(aiPrompt);
      form.setValue("staticResponse", JSON.stringify(res, null, 4));
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
        endpoint?.schemaId || null || defaultSchemaId || null
      );
    }
    if (!checked) {
      form.setValue("schemaId", null);
    }
    setIsUseSchema(checked);
  };

  const handleUseWrapperChange = (checked: boolean) => {
    if (checked) {
      form.setValue(
        "responseWrapperId",
        endpoint?.responseWrapperId || null || defaultWrapperId || null
      );
    }
    if (!checked) {
      form.setValue("responseWrapperId", null);
    }
    setIsUseWrapper(checked);
  };

  const defaultSchemaId = useMemo(() => {
    if ((endpoint && endpoint.schemaId) || schemas.length === 0)
      return undefined;
    return schemas[0].id;
  }, [schemas]);

  const defaultWrapperId = useMemo(() => {
    if (
      (endpoint && endpoint.responseWrapperId) ||
      responseWrappers.length === 0
    )
      return undefined;
    return responseWrappers[0].id;
  }, [responseWrappers]);

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <ZodForm form={form} onSubmit={onSubmit}>
      <GenericFormField
        control={form.control}
        type="input"
        name="name"
        label="Endpoint Name"
        placeholder="Users API"
      />

      <GenericFormField
        control={form.control}
        type="input"
        name="description"
        label="Description"
        placeholder="API endpoint description"
      />

      <div className="flex gap-4">
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

        <GenericFormField
          control={form.control}
          type="input"
          name="path"
          label="Path"
          placeholder="/users"
        />
      </div>

      {/* SCHEMA */}
      <div className="flex items-center gap-2">
        <Switch checked={isUseSchema} onCheckedChange={handleUseSchemaChange} />
        <Label htmlFor="use-wrapper">Use Schema</Label>
      </div>

      {isUseSchema && (
        <GenericFormField
          control={form.control}
          type="select"
          name="schemaId"
          label="Schema"
          placeholder="Select schema"
          options={schemas.map((schema) => ({
            value: schema.id.toString(),
            label: schema.name,
          }))}
          defaultValue={defaultSchemaId?.toString()}
          disabled={isLoadingSchema}
        />
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
              className="flex items-center gap-2 rounded-full"
              title="Generate Response with AI"
              description="Describe the response you want to generate"
              content={(close) => (
                <div className="flex flex-col gap-4">
                  <AutoResizeTextarea
                    placeholder="Generate a user profile response with fields for id, name, email, role, and status"
                    minRows={5}
                    value={aiPrompt}
                    onChange={handlePromptChange}
                  />
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
                      disabled={isGenerating}
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
          options={responseWrappers.map((wrapper) => ({
            value: wrapper.id.toString(),
            label: wrapper.name,
          }))}
          defaultValue={defaultWrapperId?.toString()}
          disabled={isLoadingResponseWrapper}
        />
      )}
      {isUseWrapper && (
        <ResponseWrapperView
          wrapper={
            responseWrappers.find(
              (wrapper) =>
                wrapper.id === Number(form.watch("responseWrapperId"))
            )!
          }
        />
      )}

      <FormButton isLoading={isMutating}>
        {endpoint ? "Update" : "Create"} Endpoint
      </FormButton>
    </ZodForm>
  );
}
