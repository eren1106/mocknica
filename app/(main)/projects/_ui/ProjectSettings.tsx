"use client";

import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useProject } from "@/hooks/useProject";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit, Copy, Eye, EyeOff } from "lucide-react";
import DialogButton from "@/components/dialog-button";
import ProjectForm from "@/components/project/ProjectForm";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";

export default function ProjectSettings() {
  const projectId = useCurrentProjectId();
  const { data: project, isLoading } = useProject(projectId);
  const [showToken, setShowToken] = useState(false);

  const copyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast.success("Token copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy token");
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const projectWithToken = project;

  return (
    <div className="flex flex-col gap-3">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Project Settings</h2>
          <DialogButton
            content={(close) => (
              <ProjectForm project={project} onSuccess={close} />
            )}
            className="flex items-center gap-2"
          >
            <Edit size={16} />
            Edit Project
          </DialogButton>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Name
            </label>
            <p className="">{project.name}</p>
          </div>
          {project.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="">{project.description}</p>
            </div>
          )}
          {/* <div>
            <label className="text-sm font-medium text-muted-foreground">
              Visibility
            </label>
            <div>
              <Badge variant="secondary" className="capitalize">
                {project.permission.toLowerCase()}
              </Badge>
            </div>
          </div> */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Token Authentication
            </label>
            <div>
              <Badge variant="secondary">
                {projectWithToken.isNeedToken ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              CORS Allowed Origins
            </label>
            <div>
              {project.corsOrigins && project.corsOrigins.length > 0 ? (
                <div className="space-y-1">
                  {project.corsOrigins.map((origin, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {origin}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <Badge variant="secondary">No restrictions (allows all origins)</Badge>
              )}
            </div>
          </div>
          {projectWithToken.isNeedToken && projectWithToken.token && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  API Token
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-muted rounded text-sm font-mono border">
                  {showToken ? projectWithToken.token : "•".repeat(32)}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToken(projectWithToken.token ?? "")}
                >
                  <Copy size={16} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Include this token in the Authorization header as:{" "}
                <code>Bearer {"{token}"}</code>
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
