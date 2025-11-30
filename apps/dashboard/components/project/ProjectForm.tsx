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
import { useRouter } from "next/navigation";

interface ProjectFormProps {
  project?: IProject;
  onSuccess?: () => void;
}

const ProjectForm = ({ project, onSuccess }: ProjectFormProps) => {
  const { createProject, updateProject, isPending } = useMutationProject();
  const navigate = useRouter();

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

        const project = await createProject(projectData);
        navigate.push(`/projects/${project.id}`);
      }
      onSuccess?.();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save project. Please try again.");
    }
  };

  return (
    <ZodForm
      form={form}
      onSubmit={onSubmit}
      className="w-full sm:min-w-[40rem]"
    >
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

      <FormButton isLoading={isPending}>
        {project ? "Update Project" : "Create Project"}
      </FormButton>
    </ZodForm>
  );
};

export default ProjectForm;
