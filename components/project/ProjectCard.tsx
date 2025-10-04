"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/models/project.model";
import { Edit, Trash, Users, Calendar, Eye } from "lucide-react";
import DialogButton from "@/components/dialog-button";
import ProjectForm from "./ProjectForm";
import DeleteConfirmation from "@/components/delete-confirmation";
import { formatDate } from "@/lib/utils";
import { useMutationProject } from "@/hooks/useProject";
import LinkButton from "../link-button";

const ProjectCard = ({ project }: { project: Project }) => {
  const { deleteProject } = useMutationProject();

  const handleDelete = async () => {
    await deleteProject(project.id);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-muted hover:border-border h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {project.name}
              </CardTitle>
              {/* <Badge variant="outline" className={`flex items-center gap-1`}>
                {project.permission === "PUBLIC" ? (
                  <Globe className="size-3" />
                ) : (
                  <Lock className="size-3" />
                )}
                {convertEnumToTitleCase(project.permission)}
              </Badge> */}
            </div>

            {project.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="size-3" />
                <span>{project.user.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="size-3" />
                <span>{formatDate(project.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
            <DialogButton
              variant="ghost"
              size="icon"
              className="size-8 hover:bg-accent"
              content={(close) => (
                <ProjectForm project={project} onSuccess={close} />
              )}
            >
              <Edit className="size-4" />
            </DialogButton>
            <DialogButton
              variant="ghost"
              size="icon"
              className="size-8 hover:bg-destructive/10 hover:text-destructive"
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
              <Trash className="size-4" />
            </DialogButton>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1 pt-0">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="text-lg sm:text-xl font-bold text-primary">
              {project.endpoints.length}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Endpoint{project.endpoints.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="text-lg sm:text-xl font-bold text-primary">
              {project.schemas.length}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Schema{project.schemas.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="text-lg sm:text-xl font-bold text-primary">
              {project.responseWrappers.length}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Wrapper{project.responseWrappers.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <LinkButton
          href={`/projects/${project.id}`}
          className="w-full mt-auto flex items-center gap-2"
          variant="outline"
        >
          <Eye className="size-4" />
          View Project
        </LinkButton>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
