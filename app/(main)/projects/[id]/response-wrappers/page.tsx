"use client";

import { useProject } from "@/hooks/useProject";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectResponseWrappersPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Response Wrappers</h2>
      <p className="text-muted-foreground">
        Response wrappers for this project. This feature is coming soon...
      </p>
    </div>
  );
}
