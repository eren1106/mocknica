"use client";

import React, { useMemo, useState } from "react";
import ZodForm from "../zod-form";
import * as z from "zod";
import GenericFormField from "../generic-form-field";
import FormButton from "../form-button";
import { useZodForm } from "@/hooks/useZodForm";
import { Card } from "../ui/card";
import { InfoIcon } from "lucide-react";
import { Switch } from "../ui/switch";
import { useResponseWrappers } from "@/hooks/useResponseWrapper";
import { Label } from "../ui/label";
import { useMutationEndpoint } from "@/hooks/useEndpoint";
import { useSchemas } from "@/hooks/useSchema";
import ResponseWrapperView from "@/app/(main)/projects/[id]/response-wrappers/_ui/ResponseWrapperView";
import LinkButton from "../link-button";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";

const EndpointBySchemaSchema = z.object({
  schemaId: z.coerce.number().min(1, "Schema is required"),
  basePath: z.string().min(1, "Base path is required"),
  responseWrapperId: z.union([
    z.coerce.number().int().positive(),
    z.literal(undefined),
  ]),
  projectId: z.string().min(1, "Project is required"),
});

interface EndpointBySchemaFormProps {
  onSuccess?: () => void;
}

const EndpointBySchemaForm = ({ onSuccess }: EndpointBySchemaFormProps) => {
  const projectId = useCurrentProjectId();
  
  const { createEndpointsBySchema, isPending } = useMutationEndpoint();
  const { data: schemas, isLoading: isLoadingSchema } = useSchemas(projectId);
  const { data: responseWrappers, isLoading: isLoadingResponseWrapper } =
    useResponseWrappers(projectId);

  const [isUseWrapper, setIsUseWrapper] = useState(false);

  const form = useZodForm(EndpointBySchemaSchema, {
    // schemaId: 1,
    basePath: "/data",
    projectId: projectId || "",
  });

  const onSubmit = async (data: z.infer<typeof EndpointBySchemaSchema>) => {
    try {
      await createEndpointsBySchema(data);
      onSuccess?.();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUseWrapperChange = (checked: boolean) => {
    if (checked) {
      form.setValue("responseWrapperId", responseWrappers?.[0].id);
    }
    if (!checked) {
      form.setValue("responseWrapperId", undefined);
    }
    setIsUseWrapper(checked);
  };

  const basePath = form.watch("basePath");
  const responseWrapperId = form.watch("responseWrapperId");

  const selectedWrapper = useMemo(() => {
    if (!responseWrapperId) return undefined;
    return responseWrappers?.find(
      (wrapper) => wrapper.id === Number(responseWrapperId)
    );
  }, [responseWrappers, responseWrapperId]);

  return (
    <ZodForm form={form} onSubmit={onSubmit}>
      {isLoadingSchema ? (
        <div className="flex flex-col gap-3">
          <div className="h-4 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      ) : schemas && schemas.length > 0 ? (
        <GenericFormField
          control={form.control}
          type="select"
          name="schemaId"
          label="Schema"
          placeholder="Select a schema"
          options={
            schemas?.map((schema) => ({
              value: schema.id.toString(),
              label: schema.name,
            })) || []
          }
          disabled={isLoadingSchema}
        />
      ) : (
        <div className="flex flex-col gap-3 p-4 border border-dashed rounded-lg">
          <p className="text-sm text-muted-foreground">
            No schemas available for this project. Create a schema first to generate endpoints from schema.
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
      
      {schemas && schemas.length > 0 && (
        <>
          <GenericFormField
            control={form.control}
            type="input"
            name="basePath"
            label="Base Path"
            placeholder="/data"
          />

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
              defaultValue={responseWrappers?.[0].id?.toString()}
              disabled={isLoadingResponseWrapper}
            />
          )}
          {isUseWrapper && selectedWrapper && (
            <ResponseWrapperView wrapper={selectedWrapper} />
          )}

          <p className="text-sm">Preview:</p>
          <p className="text-sm">
            <span className="font-medium text-primary mr-2">GET</span>{basePath}
          </p>
          <p className="text-sm">
            <span className="font-medium text-primary mr-2">GET</span>{basePath}
            /:id
          </p>
          <p className="text-sm">
            <span className="font-medium text-primary mr-2">POST</span>{basePath}
          </p>
          <p className="text-sm">
            <span className="font-medium text-primary mr-2">PUT</span>{basePath}
            /:id
          </p>
          <p className="text-sm">
            <span className="font-medium text-primary mr-2">DELETE</span>{basePath}
            /:id
          </p>

          <Card className="flex flex-row items-center gap-2 p-3 bg-muted">
            <InfoIcon className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              You can modify the endpoint later.
            </p>
          </Card>
          <FormButton isLoading={isPending}>Create Endpoint</FormButton>
        </>
      )}
    </ZodForm>
  );
};

export default EndpointBySchemaForm;
