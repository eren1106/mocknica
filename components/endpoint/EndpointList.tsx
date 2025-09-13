"use client";

import { Accordion } from "../ui/accordion";
import { useEndpoints } from "@/hooks/useEndpoint";
import { Skeleton } from "../ui/skeleton";
import EndpointItem from "./EndpointItem";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";

export default function EndpointsList() {
  const projectId = useCurrentProjectId();

  const { data: endpoints, isLoading: isLoadingEndpoints } =
    useEndpoints(projectId);

  if (isLoadingEndpoints) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-40" />
        <Skeleton className="w-full h-40" />
      </div>
    );
  }

  return (
    <div>
      {(endpoints?.length ?? 0) < 1 ? (
        <p className="text-muted-foreground">No endpoints available</p>
      ) : (
        <Accordion type="multiple" className="w-full flex flex-col gap-2">
          {endpoints?.map((endpoint) => (
            <EndpointItem key={endpoint.id} endpoint={endpoint} />
          ))}
        </Accordion>
      )}
    </div>
  );
}
