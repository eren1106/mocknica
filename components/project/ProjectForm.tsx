"use client";

import React, { useState } from "react";
import { useZodForm } from "@/hooks/useZodForm";
import ZodForm from "@/components/zod-form";
import GenericFormField from "@/components/generic-form-field";
import FormButton from "@/components/form-button";
import { ProjectSchema, ProjectSchemaType } from "@/zod-schemas/project.schema";
import { Project } from "@/models/project.model";
import { useMutationProject } from "@/hooks/useProject";
import { HttpMethod } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { CorsOriginsInput } from "../cors-origins-input";
import DialogButton from "../dialog-button";
import {
  Sparkles,
  X,
  Eye,
  Code,
  Database,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import AutoResizeTextarea from "../auto-resize-textarea";
import { Button } from "../ui/button";
import { ModelSelector } from "../model-selector";
import { AIService } from "@/services/ai.service";
import { Badge } from "../ui/badge";
import { SchemaField } from "@/models/schema-field.model";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { cva } from "class-variance-authority";

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
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] =
    useState<AIGeneratedData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);
  const [showExamples, setShowExamples] = useState(false);

  const examplePrompts = [
    "A blog API with posts, comments, and users. Posts can have multiple comments, and each comment belongs to a user.",
    "An e-commerce API with products, categories, orders, and customers. Include shopping cart functionality.",
    "A task management API with projects, tasks, and team members. Tasks should have priorities and due dates.",
    "A social media API with users, posts, likes, and followers. Include user authentication.",
  ];

  const handleAIPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiPrompt(e.target.value);
    setAiError(null); // Clear error when user starts typing
  };

  const handleUseExample = (example: string) => {
    setAiPrompt(example);
    setShowExamples(false);
  };

  const handleGenerateEndpointsAndSchemasByAI = async (close: () => void) => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a project description");
      return;
    }

    setIsGenerating(true);
    setAiError(null);

    try {
      const result = await AIService.generateEndpointsAndSchemasByAI(
        aiPrompt,
        selectedModel || undefined
      );

      if (!result || (!result.schemas?.length && !result.endpoints?.length)) {
        throw new Error(
          "No schemas or endpoints were generated. Please try with a more detailed description."
        );
      }

      setAiGeneratedData(result as unknown as AIGeneratedData);
      setIsPreviewExpanded(true);
      toast.success(
        `Successfully generated ${result.schemas?.length || 0} schema(s) and ${
          result.endpoints?.length || 0
        } endpoint(s)`
      );
      close();
    } catch (error) {
      console.error("Error generating endpoints and schemas:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate project structure. Please try again with a different description.";
      setAiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateAI = () => {
    setAiGeneratedData(null);
    setAiError(null);
    // Will trigger dialog to open again
  };

  const form = useZodForm(
    ProjectSchema,
    project
      ? {
          name: project.name,
          description: project.description || "",
          // permission: project.permission,
          isNeedToken: project.isNeedToken || false,
          corsOrigins: project.corsOrigins || [],
        }
      : {
          name: "",
          description: "",
          // permission: ProjectPermission.PUBLIC,
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
      toast.error("Failed to save project. Please try again.");
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

      {/* <GenericFormField
        control={form.control}
        type="select"
        name="permission"
        label="Visibility"
        options={Object.values(ProjectPermission).map((permission) => ({
          value: permission,
          label: convertEnumToTitleCase(permission),
        }))}
      /> */}

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
          size="lg"
          className={cn(
            "w-full",
            "bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 dark:from-purple-600 dark:via-blue-600 dark:to-purple-600",
            "hover:shadow-lg hover:shadow-purple-500/50",
            "active:scale-[0.98]",
            "transition-all duration-500 ease-out",
            "text-white font-semibold"
          )}
          title="Generate Project with AI ✨"
          description="Let AI create your entire project structure based on your description"
          content={(close) => (
            <div className="flex flex-col gap-6">
              {/* AI Model Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-purple-600" />
                  <label className="text-sm font-semibold">
                    AI Model (Optional)
                  </label>
                </div>
                <ModelSelector
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  placeholder="Use default model"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Choose an AI model or leave blank to use the default.
                  Different models may produce varying results.
                </p>
              </div>

              <Separator />

              {/* Project Description */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">
                    Project Description *
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExamples(!showExamples)}
                    className="text-xs h-7"
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {showExamples ? "Hide" : "See"} Examples
                  </Button>
                </div>

                {/* Example Prompts */}
                {showExamples && (
                  <Card className="p-3 bg-muted/50 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Click an example to use it:
                    </p>
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleUseExample(example)}
                        className="w-full text-left p-2 text-xs rounded-md hover:bg-background transition-colors border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                      >
                        {example}
                      </button>
                    ))}
                  </Card>
                )}

                <AutoResizeTextarea
                  placeholder="Example: A blog API with posts, comments, and users. Include authentication and CRUD operations for all resources..."
                  minRows={6}
                  value={aiPrompt}
                  onChange={handleAIPromptChange}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  💡 <strong>Tip:</strong> Be specific about your entities,
                  their relationships, and required operations for better
                  results.
                </p>
              </div>

              {/* Error Display */}
              {aiError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Generation Failed</AlertTitle>
                  <AlertDescription>{aiError}</AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => close()}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => handleGenerateEndpointsAndSchemasByAI(close)}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 text-white hover:from-purple-600 hover:to-blue-600 dark:hover:from-purple-700 dark:hover:to-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        >
          <div className="relative flex gap-3 items-center justify-center py-1">
            <div className="relative flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                <Sparkles className="size-5 animate-pulse" />
              </div>
              <div className="flex flex-col items-start">
                <p className="font-bold text-base leading-tight">
                  Setup Project with AI
                </p>
                <span className="text-xs font-normal text-purple-100">
                  Generate schemas & endpoints instantly
                </span>
              </div>
            </div>
          </div>
        </DialogButton>
      )}

      {/* AI Generated Content Preview */}
      {!project && aiGeneratedData && (
        <div className="-mx-6 px-6 py-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-blue-950/30 border-y border-purple-200 dark:border-purple-800">
          <Card className="overflow-hidden border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-b border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                      AI Generated Project Structure
                    </h3>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                      {aiGeneratedData.schemas.length} schema(s) •{" "}
                      {aiGeneratedData.endpoints.length} endpoint(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerateAI}
                    className="h-8 text-purple-700 hover:text-purple-900 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                    title="Regenerate with different prompt"
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                    className="h-8 text-purple-700 hover:text-purple-900 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                  >
                    {isPreviewExpanded ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAiGeneratedData(null)}
                    className="h-8 text-purple-700 hover:text-purple-900 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                    title="Remove AI generated data"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Collapsible Content */}
            {isPreviewExpanded && (
              <div className="p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Schemas Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-purple-200 dark:border-purple-800">
                      <Database className="size-4 text-blue-600" />
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        Schemas ({aiGeneratedData.schemas.length})
                      </h4>
                    </div>

                    {aiGeneratedData.schemas.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        <Database className="size-8 mx-auto mb-2 opacity-50" />
                        No schemas generated
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {aiGeneratedData.schemas.map((schema, index) => (
                          <Card
                            key={index}
                            className="p-3 bg-white/80 dark:bg-gray-800/80 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start sm:items-center justify-between gap-2">
                                <h5 className="font-semibold text-sm text-blue-900 dark:text-blue-100 flex-1 min-w-0">
                                  {schema.name}
                                </h5>
                                <Badge
                                  variant="secondary"
                                  className="text-xs flex-shrink-0 bg-blue-100 dark:bg-blue-900"
                                >
                                  {schema.fields?.length || 0} fields
                                </Badge>
                              </div>
                              {schema.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {schema.description}
                                </p>
                              )}
                              {schema.fields && schema.fields.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {schema.fields
                                    .slice(0, 5)
                                    .map((field, fieldIndex) => (
                                      <Badge
                                        key={fieldIndex}
                                        variant="outline"
                                        className="text-xs px-2 py-0.5 h-6 font-mono"
                                      >
                                        {field.name}
                                      </Badge>
                                    ))}
                                  {schema.fields.length > 5 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-2 py-0.5 h-6"
                                    >
                                      +{schema.fields.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Endpoints Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-purple-200 dark:border-purple-800">
                      <Code className="size-4 text-purple-600" />
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        Endpoints ({aiGeneratedData.endpoints.length})
                      </h4>
                    </div>

                    {aiGeneratedData.endpoints.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        <Code className="size-8 mx-auto mb-2 opacity-50" />
                        No endpoints generated
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {aiGeneratedData.endpoints.map((endpoint, index) => (
                          <Card
                            key={index}
                            className="p-3 bg-white/80 dark:bg-gray-800/80 border border-purple-600 hover:shadow-md transition-shadow"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className={`text-xs font-mono font-semibold flex-shrink-0 ${
                                    endpoint.method === "GET"
                                      ? "border-green-500 text-green-700 dark:text-green-400"
                                      : endpoint.method === "POST"
                                      ? "border-blue-500 text-blue-700 dark:text-blue-400"
                                      : endpoint.method === "PUT" ||
                                        endpoint.method === "PATCH"
                                      ? "border-orange-500 text-orange-700 dark:text-orange-400"
                                      : endpoint.method === "DELETE"
                                      ? "border-red-500 text-red-700 dark:text-red-400"
                                      : "border-gray-500 text-gray-700 dark:text-gray-400"
                                  }`}
                                >
                                  {endpoint.method}
                                </Badge>
                                <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all flex-1">
                                  {endpoint.path}
                                </code>
                              </div>
                              {endpoint.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {endpoint.description}
                                </p>
                              )}
                              {endpoint.isDataList && (
                                <div className="flex items-center gap-1 pt-1">
                                  <Eye className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                  <span className="text-xs text-gray-500">
                                    Returns{" "}
                                    {endpoint.numberOfData || "multiple"} items
                                  </span>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Footer */}
                <div className="mt-4 border-purple-300 dark:border-purple-700 bg-white/50 dark:bg-gray-900/50 border p-4 rounded-lg flex items-center gap-2">
                  <Sparkles className="size-4" />
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    These schemas and endpoints will be automatically created
                    when you submit the form. You can regenerate or remove them
                    before creating the project.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      <FormButton isLoading={isPending}>
        {project ? "Update Project" : "Create Project"}
      </FormButton>
    </ZodForm>
  );
};

export default ProjectForm;
