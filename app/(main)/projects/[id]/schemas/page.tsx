"use client";

import { useProject } from "@/hooks/useProject";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import SchemasPageContainer from "./_ui/SchemasPageContainer";

export default function ProjectSchemasPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return <SchemasPageContainer projectId={projectId} />;
}
