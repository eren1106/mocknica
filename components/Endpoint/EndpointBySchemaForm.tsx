'use client';

import React, { useEffect } from "react";
import ZodForm from "../zod-form";
import * as z from "zod";
import GenericFormField from "../generic-form-field";
import FormButton from "../form-button";
import { useZodForm } from "@/hooks/useZodForm";
import { Card } from "../ui/card";
import { InfoIcon } from "lucide-react";
import { useSchema } from "@/hooks/useSchema";
import Spinner from "../spinner";
import { EndpointService } from "@/services/endpoint.service";

const EndpointBySchemaSchema = z.object({
  schemaId: z.coerce.number().min(1, "Schema is required"),
  basePath: z.string().min(1, "Base path is required"),
});

interface EndpointBySchemaFormProps {
  onSuccess?: () => void;
}

const EndpointBySchemaForm = ({ onSuccess }: EndpointBySchemaFormProps) => {
  const { schemas, fetchSchemas, isLoading, isMutating } = useSchema();

  useEffect(() => {
    fetchSchemas();
  }, []);

  const form = useZodForm(EndpointBySchemaSchema, {
    // schemaId: 1,
    basePath: "data",
  });

  const onSubmit = async (data: z.infer<typeof EndpointBySchemaSchema>) => {
    try {
      await EndpointService.createEndpointsBySchema(data);
    } catch (e) {
      console.error(e);
    }
    onSuccess?.();
  };

  const basePath = form.watch("basePath");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner />
      </div>
    );
  }
	
  return (
    <ZodForm form={form} onSubmit={onSubmit}>
      <GenericFormField
        control={form.control}
        type="select"
        name="schemaId"
        label="Schema"
        placeholder="Select a schema"
        options={schemas.map((schema) => ({
          value: schema.id.toString(),
          label: schema.name,
        }))}
      />
      <GenericFormField
        control={form.control}
        type="input"
        name="basePath"
        label="Base Path"
        placeholder="data base path"
      />

      {/* TODO: add wrapper field */}

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
      <FormButton isLoading={isMutating}>Create Endpoint</FormButton>
    </ZodForm>
  );
};

export default EndpointBySchemaForm;
