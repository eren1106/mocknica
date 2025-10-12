"use client";

import DialogButton from "@/components/dialog-button";
import ProjectForm from "@/components/project/ProjectForm";
import { Plus } from "lucide-react";

export function CreateProjectButton() {
  return (
    <DialogButton
      content={(close) => <ProjectForm onSuccess={close} />}
      className="w-fit self-start lg:self-center"
      contentClassName="lg:w-[70vw]"
    >
      <Plus className="size-4 mr-2" />
      Create Project
    </DialogButton>
  );
}
