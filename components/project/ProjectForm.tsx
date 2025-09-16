"use client";

import React, { useState } from "react";
import { useZodForm } from "@/hooks/useZodForm";
import ZodForm from "@/components/zod-form";
import GenericFormField from "@/components/generic-form-field";
import FormButton from "@/components/form-button";
import { ProjectSchema, ProjectSchemaType } from "@/zod-schemas/project.schema";
import { Project } from "@/models/project.model";
import { useMutationProject } from "@/hooks/useProject";
import { ProjectPermission, HttpMethod } from "@prisma/client";
import { convertEnumToTitleCase } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { CorsOriginsInput } from "../cors-origins-input";
import DialogButton from "../dialog-button";
import { Sparkles } from "lucide-react";
import AutoResizeTextarea from "../auto-resize-textarea";
import { Button } from "../ui/button";
import { AIService } from "@/services/ai.service";
import { X, Eye, Code, Database } from "lucide-react";
import { Badge } from "../ui/badge";
import { SchemaField } from "@/models/schema-field.model";

interface ProjectFormProps {
  project?: Project;
  onSuccess?: () => void;
}

interface AIGeneratedSchema {
  name: string;
  description?: string;
  fields: SchemaField[];
}

interface AIGeneratedEndpoint {
  path: string;
  method: HttpMethod;
  description: string;
  schemaId?: number;
  isDataList?: boolean;
  numberOfData?: number;
}

interface AIGeneratedData {
  schemas: AIGeneratedSchema[];
  endpoints: AIGeneratedEndpoint[];
}

const ProjectForm = ({ project, onSuccess }: ProjectFormProps) => {
  const { createProject, updateProject, isPending } = useMutationProject();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] =
    useState<AIGeneratedData | null>(null);

  const handleAIPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiPrompt(e.target.value);
  };

  const handleGenerateEndpointsAndSchemasByAI = async (close: () => void) => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const result = await AIService.generateEndpointsAndSchemasByAI(aiPrompt);
      setAiGeneratedData(result as unknown as AIGeneratedData);
      close();
    } catch (error) {
      console.error("Error generating endpoints and schemas:", error);
      // TODO: Show error toast
    } finally {
      setIsGenerating(false);
    }
  };

  const form = useZodForm(
    ProjectSchema,
    project
      ? {
          name: project.name,
          description: project.description || "",
          permission: project.permission,
          isNeedToken: project.isNeedToken || false,
          corsOrigins: project.corsOrigins || [],
        }
      : {
          name: "",
          description: "",
          permission: ProjectPermission.PUBLIC,
          isNeedToken: false,
          corsOrigins: [],
        }
  );

  const isNeedToken = form.watch("isNeedToken");

  const onSubmit = async (data: ProjectSchemaType) => {
    try {
      if (project) {
        await updateProject({
          id: project.id,
          data,
        });
      } else {
        // Create the project with AI-generated data if available
        const projectData = {
          ...data,
          aiGeneratedData: aiGeneratedData || undefined,
        };
        
        await createProject(projectData);
      }
      onSuccess?.();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ZodForm form={form} onSubmit={onSubmit} className="min-w-[30rem]">
      <GenericFormField
        control={form.control}
        type="input"
        name="name"
        label="Project Name"
        placeholder="My Awesome API"
      />

      <GenericFormField
        control={form.control}
        type="textarea"
        name="description"
        label="Description"
        placeholder="A brief description of your project..."
        optional
      />

      <GenericFormField
        control={form.control}
        type="select"
        name="permission"
        label="Visibility"
        options={Object.values(ProjectPermission).map((permission) => ({
          value: permission,
          label: convertEnumToTitleCase(permission),
        }))}
      />

      <GenericFormField
        control={form.control}
        type="switch"
        name="isNeedToken"
        label="Require API Token"
        description="Enable this to require authentication for API access"
        optional
      />

      <GenericFormField
        control={form.control}
        type="custom"
        name="corsOrigins"
        label="CORS Allowed Origins"
        description="List of origins that are allowed to make cross-origin requests to your API"
        optional
        displayError={false}
        customChildren={
          // TODO: show validation error for each fields
          <CorsOriginsInput
            value={form.watch("corsOrigins")}
            onChange={(value) => form.setValue("corsOrigins", value)}
          />
        }
      />

      {isNeedToken && (
        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> An API token will be generated and required
            for all API calls to this project&apos;s endpoints.
          </p>
        </Card>
      )}

      {!project && (
        <DialogButton
          size="sm"
          className="w-full flex items-center gap-2 rounded-full text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
          title="Setup Project with AI"
          description="Describe your project to generate all the endpoints and schemas of this project with AI"
          content={(close) => (
            <div className="flex flex-col gap-4">
              <AutoResizeTextarea
                placeholder="Describe your project to generate all the endpoints and schemas of this project with AI"
                minRows={5}
                value={aiPrompt}
                onChange={handleAIPromptChange}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => close()}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleGenerateEndpointsAndSchemasByAI(close)}
                  disabled={isGenerating || !aiPrompt.trim()}
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
          )}
        >
          <Sparkles size={16} />
          Setup Project with AI
        </DialogButton>
      )}

      {/* AI Generated Content Preview */}
      {!project && aiGeneratedData && (
        <Card className="p-4 space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                AI Generated Project Structure
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAiGeneratedData(null)}
              className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Schemas Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  Schemas ({aiGeneratedData.schemas.length})
                </h4>
              </div>
              <div className="space-y-2">
                {aiGeneratedData.schemas.map((schema, index) => (
                  <Card
                    key={index}
                    className="p-3 bg-white/60 dark:bg-gray-800/60 border border-blue-200 dark:border-blue-800"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm text-blue-900 dark:text-blue-100">
                          {schema.name}
                        </h5>
                        <Badge variant="secondary" className="text-xs">
                          {schema.fields?.length || 0} fields
                        </Badge>
                      </div>
                      {schema.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {schema.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {schema.fields?.slice(0, 4).map((field, fieldIndex) => (
                          <Badge
                            key={fieldIndex}
                            variant="outline"
                            className="text-xs px-1 py-0 h-5"
                          >
                            {field.name}
                          </Badge>
                        ))}
                        {(schema.fields?.length || 0) > 4 && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0 h-5"
                          >
                            +{(schema.fields?.length || 0) - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Endpoints Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  Endpoints ({aiGeneratedData.endpoints.length})
                </h4>
              </div>
              <div className="space-y-2">
                {aiGeneratedData.endpoints.map((endpoint, index) => (
                  <Card
                    key={index}
                    className="p-3 bg-white/60 dark:bg-gray-800/60 border border-primary"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs font-mono border-primary"
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                          {endpoint.path}
                        </code>
                      </div>
                      {endpoint.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {endpoint.description}
                        </p>
                      )}
                      {endpoint.isDataList && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            Returns {endpoint.numberOfData || "multiple"} items
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Click &quot;Create Project&quot; to create your project with these
              AI-generated schemas and endpoints.
            </p>
          </div>
        </Card>
      )}

      {/* TODO: display all the pending create endpoints and schemas that generated by AI */}

      <FormButton isLoading={isPending}>
        {project ? "Update Project" : "Create Project"}
      </FormButton>
    </ZodForm>
  );
};

export default ProjectForm;
