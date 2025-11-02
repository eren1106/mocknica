"use client";
import React, { useState } from "react";
import { useZodForm } from "@/hooks/useZodForm";
import ZodForm from "@/components/zod-form";
import GenericFormField from "@/components/generic-form-field";
import FormButton from "@/components/form-button";
import {
  convertEnumToTitleCase,
  convertFirstLetterToUpperCase,
  getZodFieldNames,
} from "@/lib/utils";
import { EFakerType, EIdFieldType, ESchemaFieldType, ISchemaField, ISchema } from "@/types";
import { Input } from "../ui/input";
import DynamicSelect from "../dynamic-select";
import { Button } from "../ui/button";
import { Plus, Sparkles, X } from "lucide-react";
import { SchemaSchema, SchemaSchemaType } from "@/zod-schemas/schema.schema";
import { useMutationSchema, useSchemas } from "@/hooks/useSchema";
import DialogButton from "../dialog-button";
import AutoResizeTextarea from "../auto-resize-textarea";
import { AIService } from "@/services/ai.service";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";
import { ModelSelector } from "../model-selector";

const formFields = getZodFieldNames(SchemaSchema);
interface SchemaFormProps {
  schema?: ISchema;
  onSuccess?: () => void;
}
const SchemaForm = (props: SchemaFormProps) => {
  const projectId = useCurrentProjectId();

  const { data: schemas } = useSchemas(projectId);
  const { createSchema, updateSchema, isPending } = useMutationSchema();

  const form = useZodForm<SchemaSchemaType>(
    SchemaSchema,
    props.schema
      ? {
          name: props.schema.name,
          fields: props.schema.fields.map((field) => ({
            name: field.name,
            type: field.type,
            idFieldType: field.idFieldType,
            fakerType: field.fakerType,
            objectSchemaId: field.objectSchemaId,
            arrayType: field.arrayType,
          })),
        }
      : {
          name: "",
          fields: [
            {
              name: "id",
              type: ESchemaFieldType.ID,
              idFieldType: EIdFieldType.AUTOINCREMENT,
            },
            {
              name: "name",
              type: ESchemaFieldType.STRING,
            },
          ],
        }
  );
  const onSubmit = async (data: SchemaSchemaType) => {
    console.log("DATA:", data);
    try {
      if (props.schema) {
        await updateSchema({
          id: props.schema.id,
          data,
        });
      } else {
        await createSchema({
          ...data,
          projectId,
        });
      }
      props.onSuccess?.();
    } catch (e) {
      console.log(e);
    }
  };

  const fields = form.watch("fields") as ISchemaField[];

  // Function to add a new field
  const addField = () => {
    const currentFields = form.getValues("fields");
    form.setValue("fields", [
      ...currentFields,
      {
        name: "",
        type: ESchemaFieldType.STRING,
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
  const updateFieldType = (index: number, newType: ESchemaFieldType) => {
    const currentFields = form.getValues("fields");
    const updatedFields = [...currentFields];
    updatedFields[index] = { ...updatedFields[index], type: newType };
    form.setValue("fields", updatedFields);
  };

  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiPrompt(e.target.value);
  };

  const handleGenerateSchemaByAI = async (close: () => void) => {
    setIsGenerating(true);
    try {
      const response = await AIService.generateSchemaByAI(
        aiPrompt, 
        selectedModel || undefined
      );
      form.setValue("fields", response);
      close();
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ZodForm form={form} onSubmit={onSubmit} className="min-w-[36rem]">
      <GenericFormField
        type="input"
        name={formFields.name}
        control={form.control}
      />
      <GenericFormField
        type="custom"
        name={formFields.fields}
        control={form.control}
        // useFormNameAsLabel={false}
        customChildren={
          <div className="flex flex-col gap-3 w-full">
            {fields.map((field: ISchemaField, index) => {
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
                      Object.values(ESchemaFieldType).map((type) => ({
                        label: convertFirstLetterToUpperCase(type),
                        value: type,
                      })) as any
                    }
                    value={field.type}
                    onChange={(value) =>
                      updateFieldType(index, value as ESchemaFieldType)
                    }
                    className="w-full max-w-40"
                  />
                  {field.type === ESchemaFieldType.ID && (
                    <DynamicSelect
                      options={
                        Object.values(EIdFieldType).map((type) => ({
                          label: convertEnumToTitleCase(type),
                          value: type,
                        })) as any
                      }
                      defaultValue={EIdFieldType.AUTOINCREMENT}
                      value={`${field.idFieldType}`}
                      onChange={(value) => {
                        const currentFields = form.getValues("fields");
                        const updatedFields = [...currentFields];
                        updatedFields[index] = {
                          ...updatedFields[index],
                          idFieldType: value as EIdFieldType,
                        };
                        form.setValue("fields", updatedFields);
                      }}
                      className="w-full max-w-40"
                    />
                  )}
                  {field.type === ESchemaFieldType.FAKER && (
                    <DynamicSelect
                      options={
                        Object.values(EFakerType)
                          .map((type) => ({
                            label: convertEnumToTitleCase(type),
                            value: type,
                          }))
                          .sort((a, b) => a.label.localeCompare(b.label)) as any
                      }
                      value={`${field.fakerType}`}
                      onChange={(value) => {
                        const currentFields = form.getValues("fields");
                        const updatedFields = [...currentFields];
                        updatedFields[index] = {
                          ...updatedFields[index],
                          fakerType: value as EFakerType,
                        };
                        form.setValue("fields", updatedFields);
                      }}
                      className="w-full max-w-40"
                    />
                  )}
                  {field.type === ESchemaFieldType.OBJECT && (
                    <DynamicSelect
                      options={[
                        {
                          label: "Empty Object",
                          value: "0",
                        },
                        ...(schemas?.map((schema) => ({
                          label: schema.name,
                          value: schema.id.toString(),
                        })) || []),
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
                  {field.type === ESchemaFieldType.ARRAY && (
                    <>
                      <DynamicSelect
                        options={
                          Object.values(ESchemaFieldType)
                            .filter((type) => type !== ESchemaFieldType.ARRAY) // Filter out ARRAY type
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
                              elementType: value as ESchemaFieldType,
                            },
                          };
                          form.setValue("fields", updatedFields);
                        }}
                        className="w-full max-w-40"
                      />
                      {field.arrayType?.elementType ===
                        ESchemaFieldType.OBJECT && (
                        <DynamicSelect
                          options={[
                            {
                              label: "Empty Object",
                              value: "0",
                            },
                            ...(schemas?.map((schema) => ({
                              label: schema.name,
                              value: schema.id.toString(),
                            })) || []),
                          ]}
                          value={field.arrayType?.objectSchemaId?.toString()}
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
      <DialogButton
        variant="secondary"
        size="sm"
        className="flex items-center gap-2 rounded-full"
        title="Generate Response with AI"
        description="Describe the response you want to generate"
        content={(close) => (
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Model</label>
              <ModelSelector
                value={selectedModel}
                onValueChange={setSelectedModel}
                placeholder="Select AI model (optional)"
              />
              <p className="text-xs text-muted-foreground">
                Choose an AI model for generation. If not selected, the default model will be used.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <AutoResizeTextarea
                placeholder="Generate a user profile schema with fields for id, name, email, role, and status"
                minRows={5}
                value={aiPrompt}
                onChange={handlePromptChange}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => close()}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleGenerateSchemaByAI(close)}
                disabled={isGenerating || !aiPrompt.trim()}
              >
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        )}
      >
        <Sparkles size={16} />
        Generate with AI
      </DialogButton>
      <FormButton isLoading={isPending} disabled={isPending}>
        Submit
      </FormButton>
    </ZodForm>
  );
};
export default SchemaForm;
