"use client";
import React, { useEffect, useState } from "react";
import { useZodForm } from "@/hooks/useZodForm";
import ZodForm from "@/components/zod-form";
import GenericFormField from "@/components/generic-form-field";
import FormButton from "@/components/form-button";
import {
  convertEnumToTitleCase,
  convertFirstLetterToUpperCase,
  getZodFieldNames,
} from "@/lib/utils";
import { z } from "zod";
import {
  FakerType,
  IdFieldType,
  Schema,
  SchemaFieldType,
} from "@prisma/client";
import { Input } from "../ui/input";
import DynamicSelect from "../dynamic-select";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import { SchemaService } from "@/services/schema.service";
import { SchemaField } from "@/models/schema.model";

const ArrayTypeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    elementType: z.nativeEnum(SchemaFieldType).optional(),
    objectSchemaId: z.number().int().optional(),
  })
);
const SchemaFieldSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string(),
    type: z.nativeEnum(SchemaFieldType),
    fakerType: z.nativeEnum(FakerType).optional(),
    objectSchemaId: z.number().int().optional(),
    arrayType: ArrayTypeSchema.optional(),
  })
);
// Main Schema schema
const SchemaSchema = z.object({
  name: z.string().min(1),
  fields: z.array(SchemaFieldSchema),
});
// Validation functions
export const validateSchema = (data: unknown) => SchemaSchema.safeParse(data);
export const validateSchemaStrict = (data: unknown) => SchemaSchema.parse(data);
const formFields = getZodFieldNames(SchemaSchema);
interface SchemaFormProps {
  onSuccess?: () => void;
}
const SchemaForm = (props: SchemaFormProps) => {
  const [allSchemas, setAllSchemas] = useState<Schema[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const schemas = await SchemaService.getAllSchemas();
      setAllSchemas(schemas);
    } catch (e) {
      console.error(e);
    }
  };

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
    try {
      await SchemaService.createSchema(data);
      props.onSuccess?.();
    } catch (e) {
      console.error(e);
    }
  };
  const fields = form.watch("fields") as SchemaField[];

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
            {fields.map((field: SchemaField, index) => {
              return (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    placeholder="Field name"
                    value={field.name}
                    onChange={(e) => updateFieldName(index, e.target.value)}
                    className="w-full max-w-40"
                  />
                  <DynamicSelect
                    options={
                      Object.values(SchemaFieldType).map((type) => ({
                        label: convertFirstLetterToUpperCase(type),
                        value: type,
                      })) as any
                    }
                    value={field.type}
                    onChange={(value) =>
                      updateFieldType(index, value as SchemaFieldType)
                    }
                    className="w-full max-w-40"
                  />
                  {field.type === SchemaFieldType.FAKER && (
                    <DynamicSelect
                      options={
                        Object.values(FakerType).map((type) => ({
                          label: convertEnumToTitleCase(type),
                          value: type,
                        })) as any
                      }
                      value={`${field.fakerType}`}
                      onChange={(value) => {}}
                      className="w-full max-w-40"
                    />
                  )}
                  {field.type === SchemaFieldType.OBJECT && (
                    <DynamicSelect
                      options={[
                        {
                          label: "Empty Object",
                          value: "0",
                        },
                        ...allSchemas.map((schema) => ({
                          label: schema.name,
                          value: schema.id.toString(),
                        })),
                      ]}
                      value={field.objectSchemaId?.toString()}
                      onChange={(value) => {
                        const currentFields = form.getValues("fields");
                        const updatedFields = [...currentFields];
                        updatedFields[index] = {
                          ...updatedFields[index],
                          objectSchemaId: value ? Number(value) : null,
                        };
                        form.setValue("fields", updatedFields);
                      }}
                      className="w-full max-w-40"
                    />
                  )}
                  {field.type === SchemaFieldType.ARRAY && (
                    <>
                      <DynamicSelect
                        options={
                          Object.values(SchemaFieldType)
                            .filter((type) => type !== SchemaFieldType.ARRAY) // Filter out ARRAY type
                            .map((type) => ({
                              label: convertEnumToTitleCase(type),
                              value: type,
                            })) as any
                        }
                        value={field.arrayType?.elementType}
                        onChange={(value) => {
                          const currentFields = form.getValues("fields");
                          const updatedFields = [...currentFields];
                          updatedFields[index] = {
                            ...updatedFields[index],
                            arrayType: {
                              ...updatedFields[index].arrayType,
                              elementType: value as SchemaFieldType,
                            },
                          };
                          form.setValue("fields", updatedFields);
                        }}
                        className="w-full max-w-40"
                      />
                      {field.arrayType?.elementType ===
                        SchemaFieldType.OBJECT && (
                        <DynamicSelect
                          options={[
                            {
                              label: "Empty Object",
                              value: "0",
                            },
                            ...allSchemas.map((schema) => ({
                              label: schema.name,
                              value: schema.id.toString(),
                            }))
                          ]}
                          value={field.objectSchemaId?.toString()}
                          onChange={(value) => {
                            const currentFields = form.getValues("fields");
                            const updatedFields = [...currentFields];
                            updatedFields[index] = {
                              ...updatedFields[index],
                              arrayType: {
                                ...updatedFields[index].arrayType,
                                // objectType: {
                                //   ...updatedFields[index].arrayType.objectType,
                                //   schemaId: Number(value),
                                // },
                                objectSchemaId: Number(value),
                              },
                            };
                            form.setValue("fields", updatedFields);
                          }}
                          className="w-full max-w-40"
                        />
                      )}
                    </>
                  )}
                  <Button
                    size="icon"
                    className="size-8 min-w-8"
                    variant="secondary"
                    onClick={() => deleteField(index)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        }
      />
      <Button size="icon" onClick={addField}>
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
