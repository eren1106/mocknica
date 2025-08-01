'use client'

import React from "react";
import ZodForm from "@/components/zod-form";
import GenericFormField from "@/components/generic-form-field";
import { useMutationResponseWrapper } from "@/hooks/useResponseWrapper";
import { useZodForm } from "@/hooks/useZodForm";
import {
  ResponseWrapperSchema,
  ResponseWrapperSchemaType,
} from "@/zod-schemas/response-wrapper.schema";
import { getZodFieldNames } from "@/lib/utils";
import { ResponseWrapper } from "@prisma/client";
import JsonEditor from "@/components/json-editor";
import FormButton from "@/components/form-button";
import { WRAPPER_DATA_STR } from "@/constants";
import { FieldErrors } from "react-hook-form";
import { useParams } from "next/navigation";

const formFields = getZodFieldNames(ResponseWrapperSchema);
interface ResponseWrapperFormProps {
  responseWrapper?: ResponseWrapper;
  onSuccess?: () => void;
}
const ResponseWrapperForm = ({responseWrapper, onSuccess}: ResponseWrapperFormProps) => {
  const { id } = useParams();
  const projectId = id as string;

  const { createResponseWrapper, updateResponseWrapper, isPending } = useMutationResponseWrapper();
  const form = useZodForm<ResponseWrapperSchemaType>(
    ResponseWrapperSchema,
    responseWrapper
      ? {
          name: responseWrapper.name,
          // Replace "WRAPPER_DATA_STR" with WRAPPER_DATA_STR, so that the system will detect it and display it in primary color
          json: responseWrapper.json ? JSON.stringify(responseWrapper.json, undefined, 2).replaceAll(`"${WRAPPER_DATA_STR}"`, WRAPPER_DATA_STR) : undefined,
        }
      : {
          name: "",
          json: undefined,
        }
  );
  const onSubmit = async (data: ResponseWrapperSchemaType) => {
    console.log("DATA:", data);
    console.log("ProjectId being sent:", projectId);

    if (!projectId) {
      console.error("Project ID is undefined");
      return;
    }

    try {
      if(data.json) {
        // Replace WRAPPER_DATA_STR with "WRAPPER_DATA_STR" in the JSON string, so that it become valid JSON
        data.json = data.json.replace(WRAPPER_DATA_STR, `"${WRAPPER_DATA_STR}"`)
      }
      if (responseWrapper) {
        await updateResponseWrapper({
          id: responseWrapper.id,
          data: {
            ...data,
            json: data.json ? JSON.parse(data.json) : undefined,
          },
        });
      } else {
        await createResponseWrapper({
          ...data,
          json: data.json ? JSON.parse(data.json) : undefined,
          projectId: projectId,
        });
      }
      onSuccess?.();
    } catch (e) {
      console.error(e);
    }
  };
  const onError = (errors: FieldErrors<ResponseWrapperSchemaType>) => {
    console.error("Validation errors:", errors);
    const data = form.getValues(); // Retrieve all form values.
    console.log("Form values:", data);
  };
  return (
    <ZodForm form={form} onSubmit={onSubmit} onError={onError}>
      <GenericFormField
        type="input"
        name={formFields.name}
        control={form.control}
      />
      {/* TODO: show error if json is in invalid format */}
      <GenericFormField
        type="custom"
        name="json"
        control={form.control}
        placeholder="Enter JSON"
        description="Insert ${data} as the response data"
        customChildren={
          <JsonEditor
            value={form.watch("json") || ""}
            onChange={(value) => form.setValue("json", value)}
          />
        }
      />
      <FormButton isLoading={isPending}>
        {responseWrapper ? "Update" : "Create"} Response Wrapper
      </FormButton>
    </ZodForm>
  );
};

export default ResponseWrapperForm;
