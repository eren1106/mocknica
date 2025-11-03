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
import { IResponseWrapper } from "@/types";
import JsonEditor from "@/components/json-editor";
import FormButton from "@/components/form-button";
import { WRAPPER_DATA_STR } from "@/constants";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";

const formFields = getZodFieldNames(ResponseWrapperSchema);
interface ResponseWrapperFormProps {
  responseWrapper?: IResponseWrapper;
  onSuccess?: () => void;
}
const ResponseWrapperForm = ({responseWrapper, onSuccess}: ResponseWrapperFormProps) => {
  const projectId = useCurrentProjectId();

  const { createResponseWrapper, updateResponseWrapper, isPending } = useMutationResponseWrapper();
  const form = useZodForm<ResponseWrapperSchemaType>(
    ResponseWrapperSchema,
    responseWrapper
      ? {
          name: responseWrapper.name,
          json: responseWrapper.json,
        }
      : {
          name: "",
          json: JSON.stringify({
            data: WRAPPER_DATA_STR
          }, undefined, 2),
        }
  );
  const onSubmit = async (data: ResponseWrapperSchemaType) => {
    console.log("DATA:", data);

    if (!projectId) {
      console.error("Project ID is undefined");
      return;
    }

    try {
      if (responseWrapper) {
        await updateResponseWrapper({
          id: responseWrapper.id,
          data,
        });
      } else {
        await createResponseWrapper({
          ...data,
          projectId: projectId,
        });
      }
      onSuccess?.();
    } catch (e) {
      console.error(e);
    }
  };
  
  return (
    <ZodForm form={form} onSubmit={onSubmit}>
      <GenericFormField
        type="input"
        name={formFields.name}
        control={form.control}
      />
      <GenericFormField
        type="custom"
        name="json"
        control={form.control}
        placeholder="Enter JSON"
        description={`Insert "${WRAPPER_DATA_STR}" as the response data`}
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
