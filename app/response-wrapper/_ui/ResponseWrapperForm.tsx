import React from "react";
import ZodForm from "@/components/zod-form";
import GenericFormField from "@/components/generic-form-field";
import { useResponseWrapper } from "@/hooks/useResponseWrapper";
import { useZodForm } from "@/hooks/useZodForm";
import {
  ResponseWrapperSchema,
  ResponseWrapperSchemaType,
} from "@/zod-schemas/response-wrapper.schema";
import { getZodFieldNames } from "@/lib/utils";
import { ResponseWrapper } from "@prisma/client";
import JsonEditor from "@/components/json-editor";
import FormButton from "@/components/form-button";

const formFields = getZodFieldNames(ResponseWrapperSchema);
interface ResponseWrapperFormProps {
  responseWrapper?: ResponseWrapper;
  onSuccess?: () => void;
}
const ResponseWrapperForm = ({responseWrapper, onSuccess}: ResponseWrapperFormProps) => {
  const { createResponseWrapper, updateResponseWrapper, isMutating } =
    useResponseWrapper();
  const form = useZodForm<ResponseWrapperSchemaType>(
    ResponseWrapperSchema,
    responseWrapper
      ? {
          name: responseWrapper.name,
          json: responseWrapper.json ? JSON.stringify(responseWrapper.json) : null,
        }
      : {
          name: "",
          json: null,
        }
  );
  const onSubmit = async (data: ResponseWrapperSchemaType) => {
    console.log("DATA:", data);

    try {
      if (responseWrapper) {
        await updateResponseWrapper(responseWrapper.id, data);
      } else {
        await createResponseWrapper(data);
      }
      onSuccess?.();
    } catch (e) {
      console.error(e);
    }
  };
  const onError = (errors: any) => {
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
      <GenericFormField
        type="custom"
        name="json"
        control={form.control}
        placeholder="Enter JSON"
        customChildren={
          <JsonEditor
            value={form.watch("json") || ""}
            onChange={(value) => form.setValue("json", value)}
          />
        }
      />
      <FormButton isLoading={isMutating}>
        {responseWrapper ? "Update" : "Create"} Response Wrapper
      </FormButton>
    </ZodForm>
  );
};

export default ResponseWrapperForm;
