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
import { WRAPPER_DATA_STR } from "@/constants";

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

    try {
      if(data.json) {
        // Replace WRAPPER_DATA_STR with "WRAPPER_DATA_STR" in the JSON string, so that it become valid JSON
        data.json = data.json.replace(WRAPPER_DATA_STR, `"${WRAPPER_DATA_STR}"`)
      }
      if (responseWrapper) {
        await updateResponseWrapper(responseWrapper.id, {
          ...data,
          json: data.json ? JSON.parse(data.json) : undefined,
        });
      } else {
        await createResponseWrapper({
          ...data,
          json: data.json ? JSON.parse(data.json) : undefined,
        });
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
        description="Insert ${data} as the response data"
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
