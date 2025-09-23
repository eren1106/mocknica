"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DialogButton from "@/components/dialog-button";
import ResponseWrapperForm from "./ResponseWrapperForm";
import ResponseWrapperView from "./ResponseWrapperView";
import DeleteConfirmationDialog from "@/components/delete-confirmation";
import { ResponseWrapper } from "@prisma/client";
import {
  AlertCircleIcon,
  Edit,
  Trash,
  Calendar,
} from "lucide-react";
import { useMutationResponseWrapper } from "@/hooks/useResponseWrapper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEndpoints } from "@/hooks/useEndpoint";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface IResponseWrapperCardProps {
  wrapper: ResponseWrapper;
}
export default function ResponseWrapperCard({
  wrapper,
}: IResponseWrapperCardProps) {
  const { deleteResponseWrapper, isPending } = useMutationResponseWrapper();
  const projectId = useCurrentProjectId();
  const { data: endpoints, isLoading: isLoadingEndpoints } =
    useEndpoints(projectId);
  const endpointsUsingWrapper = endpoints?.filter(
    (endpoint) => endpoint.responseWrapperId === wrapper.id
  );

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-muted hover:border-border">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {wrapper.name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(wrapper.createdAt)}</span>
              </div>
              {endpointsUsingWrapper && endpointsUsingWrapper.length > 0 && (
                <Badge variant="secondary" className="">
                  {endpointsUsingWrapper.length} endpoint
                  {endpointsUsingWrapper.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DialogButton
              content={(close) => (
                <ResponseWrapperForm
                  responseWrapper={wrapper}
                  onSuccess={close}
                />
              )}
              size="sm"
              className="size-8 p-0"
              variant="outline"
            >
              <Edit size={14} />
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
                            response wrapper from the endpoints that are using
                            it.
                          </p>
                          <ul className="list-inside list-disc text-sm">
                            {endpointsUsingWrapper?.map((endpoint) => (
                              <li key={endpoint.id}>
                                {endpoint.method} {endpoint.path}
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )
                  )}
                </DeleteConfirmationDialog>
              )}
              size="sm"
              className="size-8 p-0"
              variant="outline"
            >
              <Trash size={14} />
            </DialogButton>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ResponseWrapperView wrapper={wrapper} />
      </CardContent>
    </Card>
  );
}
