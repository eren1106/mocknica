'use client';

import React, { useEffect, useState } from "react";
import ZodForm from "../zod-form";
import * as z from "zod";
import GenericFormField from "../generic-form-field";
import FormButton from "../form-button";
import { useZodForm } from "@/hooks/useZodForm";
import { Card } from "../ui/card";
import { InfoIcon } from "lucide-react";
import { Switch } from "../ui/switch";
import { useResponseWrapper } from "@/hooks/useResponseWrapper";
import { Label } from "../ui/label";
import ResponseWrapperView from "@/app/response-wrapper/_ui/ResponseWrapperView";
import { toast } from "sonner";
import { useMutationEndpoint } from "@/hooks/useEndpoint";
import { useSchemas } from "@/hooks/useSchema";

const EndpointBySchemaSchema = z.object({
  schemaId: z.coerce.number().min(1, "Schema is required"),
  basePath: z.string().min(1, "Base path is required"),
  responseWrapperId: z.union([z.coerce.number().int().positive(), z.literal(undefined)]),
});

interface EndpointBySchemaFormProps {
  onSuccess?: () => void;
}

const EndpointBySchemaForm = ({ onSuccess }: EndpointBySchemaFormProps) => {
  const { createEndpointsBySchema, isPending } = useMutationEndpoint();
  const { data: schemas, isLoading: isLoadingSchema } = useSchemas();
  const {
      fetchResponseWrappers,
      responseWrappers,
      isLoading: isLoadingResponseWrapper,
    } = useResponseWrapper();

  useEffect(() => {
    fetchResponseWrappers();
  }, []);

  const [isUseWrapper, setIsUseWrapper] = useState(false);

  const form = useZodForm(EndpointBySchemaSchema, {
    // schemaId: 1,
    basePath: "data",
  });

  const onSubmit = async (data: z.infer<typeof EndpointBySchemaSchema>) => {
    try {
      await createEndpointsBySchema(data);
      toast.success("Endpoints created successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create endpoints");
    }
    onSuccess?.();
  };

  const handleUseWrapperChange = (checked: boolean) => {
    if (checked) {
      form.setValue(
        "responseWrapperId",
        responseWrappers[0].id
      );
    }
    if (!checked) {
      form.setValue("responseWrapperId", undefined);
    }
    setIsUseWrapper(checked);
  };

  const basePath = form.watch("basePath");
  const responseWrapperId = form.watch("responseWrapperId");

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-40">
  //       <Spinner />
  //     </div>
  //   );
  // }
	
  return (
    <ZodForm form={form} onSubmit={onSubmit}>
      <GenericFormField
        control={form.control}
        type="select"
        name="schemaId"
        label="Schema"
        placeholder="Select a schema"
        options={schemas?.map((schema) => ({
          value: schema.id.toString(),
          label: schema.name,
        })) || []}
        disabled={isLoadingSchema}
      />
      <GenericFormField
        control={form.control}
        type="input"
        name="basePath"
        label="Base Path"
        placeholder="data base path"
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
          options={responseWrappers.map((wrapper) => ({
            value: wrapper.id.toString(),
            label: wrapper.name,
          }))}
          defaultValue={responseWrappers[0].id?.toString()}
          disabled={isLoadingResponseWrapper}
        />
      )}
      {isUseWrapper && (
        <ResponseWrapperView
          wrapper={
            responseWrappers.find(
              (wrapper) =>
                wrapper.id === Number(responseWrapperId)
            )!
          }
        />
      )}

      <p className="text-sm">Preview:</p>
      <p className="text-sm">
        <span className="font-medium text-primary mr-2">GET</span>/{basePath}
      </p>
      <p className="text-sm">
        <span className="font-medium text-primary mr-2">GET</span>/{basePath}
        /:id
      </p>
      <p className="text-sm">
        <span className="font-medium text-primary mr-2">POST</span>/{basePath}
      </p>
      <p className="text-sm">
        <span className="font-medium text-primary mr-2">PUT</span>/{basePath}
        /:id
      </p>
      <p className="text-sm">
        <span className="font-medium text-primary mr-2">DELETE</span>/{basePath}
        /:id
      </p>

      <Card className="flex flex-row items-center gap-2 p-3 bg-muted">
				<InfoIcon className="size-5 text-muted-foreground" />
				<p className="text-sm text-muted-foreground">You can modify the endpoint later.</p>
			</Card>
      <FormButton isLoading={isPending}>Create Endpoint</FormButton>
    </ZodForm>
  );
};

export default EndpointBySchemaForm;
