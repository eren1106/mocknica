'use client'

import DialogButton from "../dialog-button";
import { Plus } from "lucide-react";
import EndpointsList from "./EndpointList";
import { useProject } from "@/hooks/useProject";
import { Skeleton } from "../ui/skeleton";
import EndpointCreationTabs from "./EndpointCreationTabs";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";

const EndpointManagement = () => {
  const projectId = useCurrentProjectId();

  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-end gap-2 items-center">
        <DialogButton
          content={(close) => <EndpointCreationTabs onSuccess={close} />} // need 'use client' for this
          className="w-fit"
        >
          <Plus className="size-6 mr-2" />
          Create Endpoint
        </DialogButton>
      </div>
      <h2 className="text-2xl font-bold mb-3">Available Endpoints</h2>
      <EndpointsList />
    </div>
  );
};

export default EndpointManagement;
