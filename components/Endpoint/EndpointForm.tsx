"use client";

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
import { useMemo, useState } from "react";
import JsonEditor from "../json-editor";
import { Switch } from "../ui/switch";
import { useResponseWrappers } from "@/hooks/useResponseWrapper";
import { Label } from "../ui/label";
import ResponseWrapperView from "@/app/(main)/response-wrapper/_ui/ResponseWrapperView";
import { useMutationEndpoint } from "@/hooks/useEndpoint";
import { useSchemas } from "@/hooks/useSchema";
import { AIService } from "@/services/ai.service";

const EndPointSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  method: z.nativeEnum(HttpMethod),
  path: z.string().min(1, "Path is required"),
  schemaId: z.union([z.coerce.number().int().positive(), z.literal(undefined)]),
  isDataList: z.boolean().transform((val) => val ?? false),
  numberOfData: z.coerce.number().int().positive(),
  responseWrapperId: z.union([
    z.coerce.number().int().positive(),
    z.literal(undefined),
  ]),
  staticResponse: z.string().nullable(),
  projectId: z.string().min(1, "Project is required"),
});

interface EndpointFormProps {
  endpoint?: Endpoint;
  onSuccess?: () => void;
  projectId?: string;
}

export default function EndpointForm({
  endpoint,
  onSuccess,
  projectId,
}: EndpointFormProps) {
  const {
    createEndpoint,
    updateEndpoint,
    isPending: isMutatingEndpoint,
  } = useMutationEndpoint();
  const { data: schemas, isLoading: isLoadingSchema } = useSchemas(projectId);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUseWrapper, setIsUseWrapper] = useState(
    !!endpoint?.responseWrapperId
  );
  const [isUseSchema, setIsUseSchema] = useState(!!endpoint?.schemaId);

  const { data: responseWrappers, isLoading: isLoadingResponseWrapper } =
    useResponseWrappers();

  const form = useZodForm(
    EndPointSchema,
    endpoint
      ? {
          ...endpoint,
          schemaId: endpoint.schemaId || undefined,
          responseWrapperId: endpoint.responseWrapperId || undefined,
          numberOfData: endpoint.numberOfData || 3,
          staticResponse: endpoint.staticResponse
            ? JSON.stringify(endpoint.staticResponse, undefined, 4)
            : "",
          projectId: endpoint.projectId,
        }
      : {
          name: "",
          description: "",
          path: "",
          method: HttpMethod.GET,
          isDataList: false,
          numberOfData: 3,
          staticResponse: JSON.stringify(
            {
              id: 1,
              name: "John Doe",
            },
            undefined,
            4
          ),
          schemaId: undefined,
          responseWrapperId: undefined,
          projectId: projectId || "",
        }
  );

  const onSubmit = async (values: z.infer<typeof EndPointSchema>) => {
    console.log("VALUES", values);
    try {
      // TODO: fix fields order not same after parse
      if (endpoint) {
        await updateEndpoint({
          id: endpoint.id,
          data: {
            ...values,
            // cannot send stringify format, need send in object format, because the stringify process will be conducted automatically when send data via api
            staticResponse: values.staticResponse
              ? JSON.parse(values.staticResponse)
              : undefined,
          },
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
      const res = await AIService.generateResponseByAI(aiPrompt);
      form.setValue("staticResponse", JSON.stringify(res, undefined, 4));
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
    }
    if (!checked) {
      form.setValue("schemaId", undefined);
    }
    setIsUseSchema(checked);
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
  }, [schemas]);

  const defaultWrapperId = useMemo(() => {
    if (
      (endpoint && endpoint.responseWrapperId) ||
      responseWrappers?.length === 0
    )
      return undefined;
    return responseWrappers?.[0].id;
  }, [responseWrappers]);

  const selectedWrapper = useMemo(() => {
    if (!form.watch("responseWrapperId")) return undefined;
    return responseWrappers?.find(
      (wrapper) => wrapper.id === Number(form.watch("responseWrapperId"))
    );
  }, [form.watch("responseWrapperId"), responseWrappers]);

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
        optional
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
          options={
            responseWrappers?.map((wrapper) => ({
              value: wrapper.id.toString(),
              label: wrapper.name,
            })) || []
          }
          defaultValue={defaultWrapperId?.toString()}
          disabled={isLoadingResponseWrapper}
        />
      )}
      {(isUseWrapper && selectedWrapper) && <ResponseWrapperView wrapper={selectedWrapper} />}

      <FormButton isLoading={isMutatingEndpoint}>
        {endpoint ? "Update" : "Create"} Endpoint
      </FormButton>
    </ZodForm>
  );
}
