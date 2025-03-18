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
import { Plus } from "lucide-react";

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

  return (
    <ZodForm form={form} onSubmit={onSubmit}>
      <GenericFormField
        type="input"
        name={formFields.name}
        control={form.control}
      />

      {/* <GenericFormField
        type="custom"
        name={formFields.idField}
        control={form.control}
        useFormNameAsLabel={false}
        customChildren={
          <div className="flex items-center gap-3 w-full">
            <Input
              placeholder="ID field name"
              defaultValue={"id"}
              className="w-full max-w-60"
            />
            <DynamicSelect
              options={[
                { label: "UUID", value: IdFieldType.UUID },
                {
                  label: "Auto Increment",
                  value: IdFieldType.AUTOINCREMENT,
                },
              ]}
              className="w-full max-w-60"
            />
          </div>
        }
      /> */}

      <GenericFormField
        type="custom"
        name={formFields.fields}
        control={form.control}
        useFormNameAsLabel={false}
        customChildren={
          <div className="flex flex-col gap-3 w-full">
            {/* CLICK + BUTTON TO ADD MORE FIELDS */}
            {fields.map((field: SchemaField, index) => {
              const handleFieldNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                form.setValue(`fields`, [
                  ...form.getValues("fields").slice(0, index),
                  { ...field, name: e.target.value },
                  ...form.getValues("fields").slice(index + 1),
                ]);
              };

              return (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    placeholder="Field name"
                    defaultValue={field.name}
                    onChange={handleFieldNameChange}
                    className="w-full max-w-60"
                  />
                  <DynamicSelect
                    options={
                      Object.values(SchemaFieldType).map((type) => ({
                        label: convertFirstLetterToUpperCase(type),
                        value: type,
                      })) as any
                    }
                    defaultValue={field.type}
                    className="w-full max-w-60"
                  />
                </div>
              )
            })}
          </div>
        }
      />

      <Button
        size="icon"
        onClick={() => {
          // Add another field field
          console.log(form.getValues("fields"));
          form.setValue("fields", [
            ...form.getValues("fields"),
            {
              name: "",
              type: SchemaFieldType.STRING,
            },
          ]);
        }}
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
