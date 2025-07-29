"use client";

import React from "react";
import { useZodForm } from "@/hooks/useZodForm";
import ZodForm from "@/components/zod-form";
import GenericFormField from "@/components/generic-form-field";
import FormButton from "@/components/form-button";
import { ProjectSchema, ProjectSchemaType } from "@/zod-schemas/project.schema";
import { Project } from "@/models/project.model";
import { useMutationProject } from "@/hooks/useProject";
import { ProjectPermission } from "@prisma/client";
import { convertEnumToTitleCase } from "@/lib/utils";

interface ProjectFormProps {
  project?: Project;
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
          permission: project.permission,
        }
      : {
          name: "",
          description: "",
          permission: ProjectPermission.PUBLIC,
        }
  );

  const onSubmit = async (data: ProjectSchemaType) => {
    try {
      if (project) {
        await updateProject({
          id: project.id,
          data,
        });
      } else {
        await createProject(data);
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
        label="Permission"
        options={Object.values(ProjectPermission).map((permission) => ({
          value: permission,
          label: convertEnumToTitleCase(permission),
        }))}
      />

      <FormButton isLoading={isPending}>
        {project ? "Update Project" : "Create Project"}
      </FormButton>
    </ZodForm>
  );
};

export default ProjectForm;
