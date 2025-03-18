"use client";
import React from "react";
import { useZodForm } from "@/hooks/useZodForm";
import ZodForm from "@/components/zod-form";
import GenericFormField from "@/components/generic-form-field";
import FormButton from "@/components/form-button";
import { convertFirstLetterToUpperCase, getZodFieldNames } from "@/lib/utils";
import { z } from "zod";
import { FakerType, IdFieldType, SchemaField, SchemaFieldType } from "@prisma/client";
import { Input } from "../ui/input";
import DynamicSelect from "../dynamic-select";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
// Base enums
const FakerTypeEnum = z.nativeEnum(FakerType);
const ObjectTypeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    schemaId: z.number().int(),
    schemaFieldId: z.number().int(),
    schema: SchemaSchema.optional(),
    schemaField: SchemaFieldSchema.optional(),
  })
);
const ArrayTypeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    elementType: z.nativeEnum(SchemaFieldType).optional(),
    objectType: ObjectTypeSchema.optional(),
    nestedArray: ArrayTypeSchema.optional(),
    schemaFieldId: z.number().int(),
  })
);
const SchemaFieldSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    // id: z.number().int(),
    name: z.string(),
    type: z.nativeEnum(SchemaFieldType),
    fakerType: FakerTypeEnum.optional(),
    schemaId: z.number().int().optional(),
    objectType: ObjectTypeSchema.optional(),
    arrayType: ArrayTypeSchema.optional(),
  })
);
// Main Schema schema
const SchemaSchema = z.object({
  // id: z.number().int(),
  name: z.string().min(1),
  fields: z.array(SchemaFieldSchema),
  // createdAt: z.date(),
  // updatedAt: z.date(),
  // ObjectType: z.array(ObjectTypeSchema).optional(),
});
// Validation functions
export const validateSchema = (data: unknown) => SchemaSchema.safeParse(data);
export const validateSchemaStrict = (data: unknown) => SchemaSchema.parse(data);
const formFields = getZodFieldNames(SchemaSchema);
interface SchemaFormProps {
  onSuccess?: () => void;
}
const SchemaForm = (props: SchemaFormProps) => {
  const form = useZodForm(SchemaSchema, {
    name: "",
    fields: [
      {
        name: "id",
        type: SchemaFieldType.ID,
        IdFieldType: IdFieldType.UUID,
      },
      {
        name: "name",
        type: SchemaFieldType.STRING,
      },
    ],
  });
  const onSubmit = async (data: z.infer<typeof SchemaSchema>) => {
    console.log("DATA:", data);
  };
  const fields = form.watch("fields");
  
  // Function to add a new field
  const addField = () => {
    const currentFields = form.getValues("fields");
    form.setValue("fields", [
      ...currentFields,
      {
        name: "",
        type: SchemaFieldType.STRING,
      },
    ]);
  };
  
  // Function to delete a field by index
  const deleteField = (indexToDelete: number) => {
    const currentFields = form.getValues("fields");
    form.setValue(
      "fields", 
      currentFields.filter((_, i) => i !== indexToDelete)
    );
  };
  
  // Function to update a field's name
  const updateFieldName = (index: number, newName: string) => {
    const currentFields = form.getValues("fields");
    const updatedFields = [...currentFields];
    updatedFields[index] = { ...updatedFields[index], name: newName };
    form.setValue("fields", updatedFields);
  };
  
  // Function to update a field's type
  const updateFieldType = (index: number, newType: SchemaFieldType) => {
    const currentFields = form.getValues("fields");
    const updatedFields = [...currentFields];
    updatedFields[index] = { ...updatedFields[index], type: newType };
    form.setValue("fields", updatedFields);
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
        name={formFields.fields}
        control={form.control}
        useFormNameAsLabel={false}
        customChildren={
          <div className="flex flex-col gap-3 w-full">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  placeholder="Field name"
                  value={field.name}
                  onChange={(e) => updateFieldName(index, e.target.value)}
                  className="w-full max-w-60"
                />
                <DynamicSelect
                  options={
                    Object.values(SchemaFieldType).map((type) => ({
                      label: convertFirstLetterToUpperCase(type),
                      value: type,
                    })) as any
                  }
                  value={field.type}
                  onChange={(value) => updateFieldType(index, value as SchemaFieldType)}
                  className="w-full max-w-60"
                />
                <Button 
                  size="icon" 
                  className="size-8" 
                  variant="secondary" 
                  onClick={() => deleteField(index)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        }
      />
      <Button
        size="icon"
        onClick={addField}
      >
        <Plus className="size-6" />
      </Button>
      <FormButton
        isLoading={form.formState.isSubmitting}
        disabled={form.formState.isSubmitting}
      >
        Submit
      </FormButton>
    </ZodForm>
  );
};
export default SchemaForm;