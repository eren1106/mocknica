"use client";

import { useProject } from "@/hooks/useProject";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import ResponseWrappersPageContainer from "./_ui/ResponseWrappersPageContainer";

export default function ProjectResponseWrappersPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!projectId) {
    return <div>Invalid project URL</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <ResponseWrappersPageContainer projectId={projectId} />
  );
}
