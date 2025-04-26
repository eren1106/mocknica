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
import { useState } from "react";
import { EndpointService } from "@/services/endpoint.service";

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
  const { createEndpoint, updateEndpoint, isMutating } = useEndpoint();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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
        await updateEndpoint(endpoint.id, {
          ...values,
          // cannot send stringy format, need send in object format, because the stringify process will be conducted automatically when send data via api
          staticResponse: values.staticResponse ? JSON.parse(values.staticResponse) : undefined,
        });
      } else {
        await createEndpoint(values);
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
        minRows={5}
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
                  <Button variant="outline" onClick={() => close()}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleGenerateResponseByAI(close)} disabled={isGenerating}>
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

      <FormButton isLoading={isMutating}>
        {endpoint ? "Update" : "Create"} Endpoint
      </FormButton>
    </ZodForm>
  );
}
