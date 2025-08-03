"use client";

import React from "react";
import DialogButton from "@/components/dialog-button";
import { Plus } from "lucide-react";
import ProjectList from "./ProjectList";
import ProjectForm from "./ProjectForm";
import { useAuth } from "@/hooks/useAuth";

const ProjectManagement = () => {
  const { isAuthenticated } = useAuth();

  // This component should only be rendered within an AuthGuard,
  // but adding this as an extra safety measure
  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Organize your APIs into projects. Each project can contain endpoints, schemas, and response wrappers.
          </p>
        </div>
        <DialogButton
          content={(close) => <ProjectForm onSuccess={close} />}
          className="w-fit"
        >
          <Plus className="size-6 mr-2" />
          Create Project
        </DialogButton>
      </div>
      <ProjectList />
    </div>
  );
};

export default ProjectManagement;
