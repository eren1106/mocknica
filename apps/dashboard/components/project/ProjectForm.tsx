"use client";

import React from "react";
import { useZodForm } from "@/hooks/useZodForm";
import ZodForm from "@/components/zod-form";
import GenericFormField from "@/components/generic-form-field";
import FormButton from "@/components/form-button";
import { ProjectSchema, ProjectSchemaType } from "@/zod-schemas/project.schema";
import { useMutationProject } from "@/hooks/useProject";
import { IProject } from "@/types";
import { Card } from "@/components/ui/card";
import { CorsOriginsInput } from "../cors-origins-input";
import { toast } from "sonner";

interface ProjectFormProps {
  project?: IProject;
  onSuccess?: () => void;
}

const ProjectForm = ({ project, onSuccess }: ProjectFormProps) => {
  const { createProject, updateProject, isPending } = useMutationProject();

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
        const projectData = {
          ...data,
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

      {/* {!project && (
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
            <AIGenerationDialog
              onGenerate={handleAIGenerate}
              onClose={close}
              generationType="project"
            />
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
      )} */}

      {/* AI Generated Content Preview */}
      {/* {!project && aiGeneratedData && (
        <AIGeneratedPreview
          data={aiGeneratedData}
          onRegenerate={handleRegenerateAI}
          onRemove={handleRemoveAI}
          isExpanded={isPreviewExpanded}
          onToggleExpand={() => setIsPreviewExpanded(!isPreviewExpanded)}
        />
      )} */}

      <FormButton isLoading={isPending}>
        {project ? "Update Project" : "Create Project"}
      </FormButton>
    </ZodForm>
  );
};

export default ProjectForm;
