"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Endpoint, HttpMethod, ResponseGeneration } from "@prisma/client";
import { toast } from "sonner";
import { useEndpoint } from "@/hooks/useEndpoint";
import AutoResizeTextarea from "../auto-resize-textarea";
import GenericFormField from "../generic-form-field";
import ZodForm from "../zod-form";
import { useZodForm } from "@/hooks/useZodForm";
import FormButton from "../form-button";

const EndPointSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  method: z.nativeEnum(HttpMethod),
  path: z.string().min(1, "Path is required"),
  // parameters: z.string().optional(),
  // requestBody: z.string().optional(),
  // responseSchema: z.string().min(1, "Response schema is required"),
  // responseGen: z.nativeEnum(ResponseGeneration),
  staticResponse: z.string().nullable(),
  // arrayQuantity: z.number().optional(),
});

interface EndpointFormProps {
  endpoint?: Endpoint;
  onSuccess?: () => void;
}

export default function EndpointForm({
  endpoint,
  onSuccess,
}: EndpointFormProps) {
  const { createEndpoint, updateEndpoint } = useEndpoint();

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
    try {
      if (endpoint) {
        await updateEndpoint(endpoint.id, values);
      } else {
        await createEndpoint(values);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error creating endpoint:", error);
      toast.error(`Failed to ${endpoint ? "update" : "create"} endpoint`);
    }
  };

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

      <GenericFormField
        control={form.control}
        type="textarea"
        name="staticResponse"
        label="Static Response (JSON)"
        placeholder='{"id": 1, "name": "John Doe"}'
      />

      <FormButton>
        {endpoint ? "Update" : "Create"} Endpoint
      </FormButton>
    </ZodForm>
  );
}
