"use client";
import React, { useState, useMemo, useCallback, useRef } from "react";
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

// Static dropdown options - computed once at module load
const FIELD_TYPE_OPTIONS = Object.values(ESchemaFieldType).map((type) => ({
  label: convertFirstLetterToUpperCase(type),
  value: type,
}));

const ID_FIELD_TYPE_OPTIONS = Object.values(EIdFieldType).map((type) => ({
  label: convertEnumToTitleCase(type),
  value: type,
}));

const FAKER_TYPE_OPTIONS = Object.values(EFakerType)
  .map((type) => ({
    label: convertEnumToTitleCase(type),
    value: type,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const ARRAY_TYPE_OPTIONS = Object.values(ESchemaFieldType)
  .filter((type) => type !== ESchemaFieldType.ARRAY)
  .map((type) => ({
    label: convertEnumToTitleCase(type),
    value: type,
  }));

// CRITICAL: Separate field row component with proper memoization
const SchemaFieldRow = React.memo(
  ({
    field,
    index,
    fieldError,
    schemas,
    onUpdateField,
    onDelete,
  }: {
    field: ISchemaField;
    index: number;
    fieldError: any;
    schemas: ISchema[] | undefined;
    onUpdateField: (index: number, updates: Partial<ISchemaField>) => void;
    onDelete: (index: number) => void;
  }) => {
    // Memoize schema options
    const schemaOptions = useMemo(
      () => [
        { label: "Empty Object", value: "0" },
        ...(schemas?.map((schema) => ({
          label: schema.name,
          value: schema.id.toString(),
        })) || []),
      ],
      [schemas]
    );

    // Local handlers that prevent parent re-renders
    const handleNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateField(index, { name: e.target.value });
      },
      [index, onUpdateField]
    );

    const handleTypeChange = useCallback(
      (value: string) => {
        onUpdateField(index, { type: value as ESchemaFieldType });
      },
      [index, onUpdateField]
    );

    const handleIdFieldTypeChange = useCallback(
      (value: string) => {
        onUpdateField(index, { idFieldType: value as EIdFieldType });
      },
      [index, onUpdateField]
    );

    const handleFakerTypeChange = useCallback(
      (value: string) => {
        onUpdateField(index, { fakerType: value as EFakerType });
      },
      [index, onUpdateField]
    );

    const handleObjectSchemaIdChange = useCallback(
      (value: string) => {
        onUpdateField(index, { objectSchemaId: value ? Number(value) : null });
      },
      [index, onUpdateField]
    );

    const handleArrayTypeChange = useCallback(
      (value: string) => {
        onUpdateField(index, {
          arrayType: {
            elementType: value as ESchemaFieldType,
            objectSchemaId: field.arrayType?.objectSchemaId || null,
            fakerType: field.arrayType?.fakerType || null,
          },
        });
      },
      [index, onUpdateField, field.arrayType]
    );

    const handleArrayObjectSchemaIdChange = useCallback(
      (value: string) => {
        onUpdateField(index, {
          arrayType: {
            elementType: field.arrayType?.elementType || ESchemaFieldType.STRING,
            objectSchemaId: Number(value),
            fakerType: field.arrayType?.fakerType || null,
          },
        });
      },
      [index, onUpdateField, field.arrayType]
    );

    const handleDelete = useCallback(() => {
      onDelete(index);
    }, [index, onDelete]);

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-1 w-full max-w-40">
            <Input
              placeholder="Field name"
              value={field.name}
              onChange={handleNameChange}
              className={cn("w-full", fieldError && "border-destructive")}
            />
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError.message}</p>
            )}
          </div>
          <DynamicSelect
            options={FIELD_TYPE_OPTIONS as any}
            value={field.type}
            onChange={handleTypeChange}
            className="w-full max-w-40"
          />
          {field.type === ESchemaFieldType.ID && (
            <DynamicSelect
              options={ID_FIELD_TYPE_OPTIONS as any}
              defaultValue={EIdFieldType.AUTOINCREMENT}
              value={`${field.idFieldType}`}
              onChange={handleIdFieldTypeChange}
              className="w-full max-w-40"
            />
          )}
          {field.type === ESchemaFieldType.FAKER && (
            <DynamicSelect
              options={FAKER_TYPE_OPTIONS as any}
              value={`${field.fakerType}`}
              onChange={handleFakerTypeChange}
              className="w-full max-w-40"
            />
          )}
          {field.type === ESchemaFieldType.OBJECT && (
            <DynamicSelect
              options={schemaOptions}
              value={field.objectSchemaId?.toString()}
              onChange={handleObjectSchemaIdChange}
              className="w-full max-w-40"
            />
          )}
          {field.type === ESchemaFieldType.ARRAY && (
            <>
              <DynamicSelect
                options={ARRAY_TYPE_OPTIONS as any}
                value={field.arrayType?.elementType}
                onChange={handleArrayTypeChange}
                className="w-full max-w-40"
              />
              {field.arrayType?.elementType === ESchemaFieldType.OBJECT && (
                <DynamicSelect
                  options={schemaOptions}
                  value={field.arrayType?.objectSchemaId?.toString()}
                  onChange={handleArrayObjectSchemaIdChange}
                  className="w-full max-w-40"
                />
              )}
            </>
          )}
          <Button
            size="icon"
            className="size-8 min-w-8"
            variant="secondary"
            onClick={handleDelete}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for deep equality on field object
    return (
      prevProps.index === nextProps.index &&
      prevProps.fieldError === nextProps.fieldError &&
      prevProps.schemas === nextProps.schemas &&
      JSON.stringify(prevProps.field) === JSON.stringify(nextProps.field)
    );
  }
);

SchemaFieldRow.displayName = "SchemaFieldRow";

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

  const fields = form.watch("fields");

  // OPTIMIZATION: Debounce form updates to reduce re-renders
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedSetValue = useCallback(
    (fields: ISchemaField[], shouldValidate = false) => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        form.setValue("fields", fields, { shouldValidate });
      });
    },
    [form]
  );

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

  // CRITICAL: Single unified update function to reduce callback recreations
  const updateField = useCallback(
    (index: number, updates: Partial<ISchemaField>) => {
      const currentFields = form.getValues("fields");
      const updatedFields = [...currentFields];
      updatedFields[index] = {
        ...updatedFields[index],
        ...updates,
      };
      
      // Determine if we need validation
      const shouldValidate = "name" in updates || "type" in updates;
      
      debouncedSetValue(updatedFields, shouldValidate);
    },
    [form, debouncedSetValue]
  );

  const addField = useCallback(() => {
    const currentFields = form.getValues("fields");
    form.setValue(
      "fields",
      [
        ...currentFields,
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
  }, [form]);

  const deleteField = useCallback(
    (indexToDelete: number) => {
      const currentFields = form.getValues("fields");
      form.setValue(
        "fields",
        currentFields.filter((_, i) => i !== indexToDelete)
      );
    },
    [form]
  );

  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAiPrompt(e.target.value);
    },
    []
  );

  const handleGenerateSchemaByAI = useCallback(
    async (close: () => void) => {
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
    },
    [aiPrompt, selectedModel, form]
  );

  // Memoize the fields list to prevent unnecessary re-renders
  const fieldsList = useMemo(
    () =>
      fields.map((field: ISchemaField, index) => {
        const fieldError = (form.formState.errors.fields as any)?.[index]?.name;
        return (
          <SchemaFieldRow
            key={index}
            field={field}
            index={index}
            fieldError={fieldError}
            schemas={schemas}
            onUpdateField={updateField}
            onDelete={deleteField}
          />
        );
      }),
    [fields, form.formState.errors.fields, schemas, updateField, deleteField]
  );

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
          <div className="flex flex-col gap-3 w-full">{fieldsList}</div>
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