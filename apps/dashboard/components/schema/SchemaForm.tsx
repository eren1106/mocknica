"use client";
import React, { useState } from "react";
import { useZodForm } from "@/hooks/useZodForm";
import ZodForm from "@/components/zod-form";
import GenericFormField from "@/components/generic-form-field";
import FormButton from "@/components/form-button";
import {
  cn,
  convertEnumToTitleCase,
  convertFirstLetterToUpperCase,
  getZodFieldNames,
} from "@/lib/utils";
import {
  EFakerType,
  EIdFieldType,
  ESchemaFieldType,
  ISchemaField,
  ISchema,
} from "@/types";
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
import MyTooltip from "../my-tooltip";

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
          fields: props.schema.fields || [],
        }
      : {
          name: "",
          fields: [
            {
              name: "id",
              type: ESchemaFieldType.ID,
              idFieldType: EIdFieldType.AUTOINCREMENT,
              objectSchemaId: null,
              fakerType: null,
              arrayType: null,
            },
            {
              name: "name",
              type: ESchemaFieldType.STRING,
              idFieldType: null,
              objectSchemaId: null,
              fakerType: null,
              arrayType: null,
            },
          ],
        }
  );

  // Convert fields to fields for UI rendering
  const fields = form.watch("fields");

  const onSubmit = async (data: SchemaSchemaType) => {
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

  // Function to add a new field
  const addField = () => {
    const currentSchemaFields = form.getValues("fields");
    form.setValue(
      "fields",
      [
        ...currentSchemaFields,
        {
          name: "",
          type: ESchemaFieldType.STRING,
          idFieldType: null,
          objectSchemaId: null,
          fakerType: null,
          arrayType: null,
        },
      ],
      { shouldValidate: false }
    );
  };

  // Function to delete a field by index
  const deleteField = (indexToDelete: number) => {
    const currentSchemaFields = form.getValues("fields");
    form.setValue(
      "fields",
      currentSchemaFields.filter((_, i) => i !== indexToDelete)
    );
  };

  // Function to update a field's name
  const updateFieldName = (index: number, newName: string) => {
    const currentSchemaFields = form.getValues("fields");
    const updatedSchemaFields = [...currentSchemaFields];
    updatedSchemaFields[index] = {
      ...updatedSchemaFields[index],
      name: newName,
    };
    form.setValue("fields", updatedSchemaFields, { shouldValidate: true });
  };

  // Function to update a field's type
  const updateFieldType = (index: number, newType: ESchemaFieldType) => {
    const currentSchemaFields = form.getValues("fields");
    const updatedSchemaFields = [...currentSchemaFields];
    updatedSchemaFields[index] = {
      ...updatedSchemaFields[index],
      type: newType,
    };
    form.setValue("fields", updatedSchemaFields, { shouldValidate: true });
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
        displayError={false}
        customChildren={
          <div className="flex flex-col gap-3 w-full">
            {fields.map((field: ISchemaField, index) => {
              const fieldError = (form.formState.errors.fields as any)?.[index]
                ?.name;
              return (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1 w-full max-w-40">
                      <Input
                        placeholder="Field name"
                        value={field.name}
                        onChange={(e) => updateFieldName(index, e.target.value)}
                        className={cn(
                          "w-full",
                          fieldError && "border-destructive"
                        )}
                      />
                      {fieldError && (
                        <p className="text-sm text-destructive">
                          {fieldError.message}
                        </p>
                      )}
                    </div>
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
                          const currentSchemaFields = form.getValues("fields");
                          const updatedSchemaFields = [...currentSchemaFields];
                          updatedSchemaFields[index] = {
                            ...updatedSchemaFields[index],
                            idFieldType: value as EIdFieldType,
                          };
                          form.setValue("fields", updatedSchemaFields, {
                            shouldValidate: false,
                          });
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
                            .sort((a, b) =>
                              a.label.localeCompare(b.label)
                            ) as any
                        }
                        value={`${field.fakerType}`}
                        onChange={(value) => {
                          const currentSchemaFields = form.getValues("fields");
                          const updatedSchemaFields = [...currentSchemaFields];
                          updatedSchemaFields[index] = {
                            ...updatedSchemaFields[index],
                            fakerType: value as EFakerType,
                          };
                          form.setValue("fields", updatedSchemaFields, {
                            shouldValidate: false,
                          });
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
                          const currentSchemaFields = form.getValues("fields");
                          const updatedSchemaFields = [...currentSchemaFields];
                          updatedSchemaFields[index] = {
                            ...updatedSchemaFields[index],
                            objectSchemaId: value ? Number(value) : null,
                          };
                          form.setValue("fields", updatedSchemaFields, {
                            shouldValidate: false,
                          });
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
                            const currentSchemaFields =
                              form.getValues("fields");
                            const updatedSchemaFields = [
                              ...currentSchemaFields,
                            ];
                            updatedSchemaFields[index] = {
                              ...updatedSchemaFields[index],
                              arrayType: {
                                elementType: value as ESchemaFieldType,
                                objectSchemaId:
                                  updatedSchemaFields[index].arrayType
                                    ?.objectSchemaId || null,
                                fakerType:
                                  updatedSchemaFields[index].arrayType
                                    ?.fakerType || null,
                              },
                            };
                            form.setValue("fields", updatedSchemaFields, {
                              shouldValidate: false,
                            });
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
                              const currentSchemaFields =
                                form.getValues("fields");
                              const updatedSchemaFields = [
                                ...currentSchemaFields,
                              ];
                              const currentArrayType =
                                updatedSchemaFields[index].arrayType;
                              updatedSchemaFields[index] = {
                                ...updatedSchemaFields[index],
                                arrayType: {
                                  elementType:
                                    currentArrayType?.elementType ||
                                    ESchemaFieldType.STRING,
                                  objectSchemaId: Number(value),
                                  fakerType:
                                    currentArrayType?.fakerType || null,
                                },
                              };
                              form.setValue("fields", updatedSchemaFields, {
                                shouldValidate: false,
                              });
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
                </div>
              );
            })}
          </div>
        }
      />
      <div className="flex justify-between items-center">
        <MyTooltip content="Add Field" asChild>
          <Button size="icon" onClick={addField}>
            <Plus className="size-6" />
          </Button>
        </MyTooltip>

        <DialogButton
          variant="secondary"
          size="sm"
          className={cn(
            "flex items-center gap-2 rounded-full",
            "bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 text-white hover:from-purple-600 hover:to-blue-600 dark:hover:from-purple-700 dark:hover:to-blue-700"
          )}
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
                  Choose an AI model for generation. If not selected, the
                  default model will be used.
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
      </div>

      <FormButton isLoading={isPending} disabled={isPending}>
        Submit
      </FormButton>
    </ZodForm>
  );
};
export default SchemaForm;
