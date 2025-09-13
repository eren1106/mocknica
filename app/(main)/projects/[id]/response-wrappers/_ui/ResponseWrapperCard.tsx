"use client";

import { Card } from "@/components/ui/card";
import DialogButton from "@/components/dialog-button";
import ResponseWrapperForm from "./ResponseWrapperForm";
import ResponseWrapperView from "./ResponseWrapperView";
import DeleteConfirmationDialog from "@/components/delete-confirmation";
import { ResponseWrapper } from "@prisma/client";
import { AlertCircleIcon, Edit, Trash } from "lucide-react";
import { useMutationResponseWrapper } from "@/hooks/useResponseWrapper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEndpoints } from "@/hooks/useEndpoint";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";

interface IResponseWrapperCardProps {
  wrapper: ResponseWrapper;
}
export default function ResponseWrapperCard({
  wrapper,
}: IResponseWrapperCardProps) {
  const { deleteResponseWrapper, isPending } = useMutationResponseWrapper();
  const projectId = useCurrentProjectId();
  const { data: endpoints, isLoading: isLoadingEndpoints } = useEndpoints(projectId);
  const endpointsUsingWrapper = endpoints?.filter(
    (endpoint) => endpoint.responseWrapperId === wrapper.id
  );

  return (
    <Card key={wrapper.id} className="gap-3">
      <div className="flex justify-between items-center">
        <h2>{wrapper.name}</h2>
        <div className="flex items-center gap-2">
          <DialogButton
            content={(close) => (
              <ResponseWrapperForm
                responseWrapper={wrapper}
                onSuccess={close}
              />
            )}
            className="size-10 p-0"
            variant="outline"
          >
            <Edit size={16} />
          </DialogButton>
          <DialogButton
            content={(close) => (
              <DeleteConfirmationDialog
                title="Delete Response Wrapper"
                description="Are you sure you want to delete this response wrapper?"
                onConfirm={() => deleteResponseWrapper(wrapper.id)}
                onCancel={close}
                isLoading={isPending}
              >
                {isLoadingEndpoints ? (
                  <Skeleton />
                ) : (
                  endpointsUsingWrapper &&
                  endpointsUsingWrapper?.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>
                        Some endpoints are using this response wrapper
                      </AlertTitle>
                      <AlertDescription>
                        <p>
                          Deleting this response wrapper will remove the
                          response wrapper from the endpoints that are using it.
                        </p>
                        <ul className="list-inside list-disc text-sm">
                          {endpointsUsingWrapper?.map((endpoint) => (
                            <li key={endpoint.id}>{endpoint.method} {endpoint.path}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )
                )}
              </DeleteConfirmationDialog>
            )}
            className="size-10 p-2"
            variant="outline"
          >
            <Trash size={16} />
          </DialogButton>
        </div>
      </div>
      <ResponseWrapperView wrapper={wrapper} />
    </Card>
  );
}
