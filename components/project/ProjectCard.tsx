"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/models/project.model";
import { Edit, Trash, Users, Globe, Lock } from "lucide-react";
import DialogButton from "@/components/dialog-button";
import ProjectForm from "./ProjectForm";
import DeleteConfirmation from "@/components/delete-confirmation";
import { Badge } from "@/components/ui/badge";
import { convertEnumToTitleCase } from "@/lib/utils";
import { useMutationProject } from "@/hooks/useProject";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const ProjectCard = ({ project }: { project: Project }) => {
  const { deleteProject } = useMutationProject();
  const router = useRouter();

  const handleDelete = async () => {
    await deleteProject(project.id);
  };

  const handleViewProject = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            {project.permission === "PUBLIC" ? (
              <Globe className="size-3" />
            ) : (
              <Lock className="size-3" />
            )}
            {convertEnumToTitleCase(project.permission)}
          </Badge>
        </div>
        <div className="flex flex-row gap-1">
          <DialogButton
            variant="outline"
            className="size-10 p-0"
            content={(close) => (
              <ProjectForm project={project} onSuccess={close} />
            )}
          >
            <Edit size={16} />
          </DialogButton>
          <DialogButton
            variant="outline"
            className="size-10 p-0"
            title="Delete Project"
            description="Are you sure you want to delete this project? This action cannot be undone and will delete all associated endpoints, schemas, and response wrappers."
            content={(close) => (
              <DeleteConfirmation
                onConfirm={async () => {
                  await handleDelete();
                  close();
                }}
                onCancel={close}
              />
            )}
          >
            <Trash size={16} />
          </DialogButton>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {project.description && (
          <p className="text-sm text-muted-foreground">{project.description}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="size-4" />
            <span>{project.user.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {project.endpoints.length}
            </div>
            <div className="text-xs text-muted-foreground">Endpoints</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {project.schemas.length}
            </div>
            <div className="text-xs text-muted-foreground">Schemas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {project.responseWrappers.length}
            </div>
            <div className="text-xs text-muted-foreground">Wrappers</div>
          </div>
        </div>

        <Button 
          onClick={handleViewProject}
          className="w-full mt-2"
          variant="outline"
        >
          View Project
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
