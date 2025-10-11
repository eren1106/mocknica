import { Endpoint } from "@/models/endpoint.model";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import { Button } from "../ui/button";
import DialogButton from "../dialog-button";
import DeleteConfirmationDialog from "../delete-confirmation";
import EndpointForm from "./EndpointForm";
import JsonViewer from "../json-viewer";
import { cn } from "@/lib/utils";
import {
  Copy,
  Edit,
  Trash,
  Database,
  FileJson2,
  Clock,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useMutationEndpoint } from "@/hooks/useEndpoint";
import { EndpointService } from "@/services/endpoint.service";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

interface IEndpointItemProps {
  endpoint: Endpoint;
}

export default function EndpointItem({ endpoint }: IEndpointItemProps) {
  const projectId = useCurrentProjectId();

  const { deleteEndpoint, isPending: isMutatingEndpoints } =
    useMutationEndpoint();

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "border border-green-500 text-green-500 bg-green-500/10 dark:border-green-400 dark:text-green-400 dark:bg-green-400/10";
      case "POST":
        return "border border-yellow-500 text-yellow-500 bg-yellow-500/10 dark:border-yellow-400 dark:text-yellow-400 dark:bg-yellow-400/10";
      case "PUT":
        return "border border-blue-500 text-blue-500 bg-blue-500/10 dark:border-blue-400 dark:text-blue-400 dark:bg-blue-400/10";
      case "DELETE":
        return "border border-red-500 text-red-500 bg-red-500/10 dark:border-red-400 dark:text-red-400 dark:bg-red-400/10";
      case "PATCH":
        return "border border-purple-500 text-purple-500 bg-purple-500/10 dark:border-purple-400 dark:text-purple-400 dark:bg-purple-400/10";
      default:
        return "border border-gray-500 text-gray-500 bg-gray-500/10 dark:border-gray-400 dark:text-gray-400 dark:bg-gray-400/10";
    }
  };

  const formatDate = (date: Date | string) => {
    const endpointDate = new Date(date);
    return endpointDate.toLocaleDateString();
  };

  const copyEndpointUrl = async (endpoint: any) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fullUrl = `${baseUrl}/api/mock/${projectId}${endpoint.path}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Endpoint URL copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <AccordionItem
      value={endpoint.id}
      key={endpoint.id}
      className="border-none shadow-sm rounded-md"
    >
      <AccordionTrigger className="bg-background hover:no-underline border border-muted rounded-md py-3 px-4 data-[state=open]:rounded-b-none data-[state=open]:border-b-0 transition-all">
        <div className="flex items-center gap-4 w-full mr-3">
          {/* Method Badge */}
          <Badge
            className={cn(
              "w-20 py-1 px-3 font-semibold text-center justify-center",
              getMethodColor(endpoint.method)
            )}
          >
            {endpoint.method}
          </Badge>

          {/* Endpoint Info */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 text-left">
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-bold text-foreground">{endpoint.description}</p>
              <code className="text-sm text-muted-foreground bg-muted px-2 rounded w-fit">
                {endpoint.path}
              </code>
            </div>

            {/* Metadata */}
            <div className="flex-wrap xs:flex hidden items-center gap-1 sm:gap-2 md:gap-4 text-xs text-muted-foreground">
              {endpoint.schema && (
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>{endpoint.schema.name}</span>
                </div>
              )}
              {endpoint.responseWrapper && (
                <div className="flex items-center gap-1">
                  <FileJson2 className="h-3 w-3" />
                  <span>Wrapped</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(endpoint.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="bg-background flex flex-col gap-4 border border-muted rounded-md p-4 pt-0 border-t-0 rounded-t-none">
        {/* Actions Bar */}
        <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-1">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              onClick={() => copyEndpointUrl(endpoint)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Copy size={14} />
              Copy URL
            </Button>
            {/* <Button
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_APP_URL}/api/mock/${projectId}${endpoint.path}`, '_blank')}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <ExternalLink size={14} />
              Test
            </Button> */}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <DialogButton
              content={(close) => (
                <EndpointForm onSuccess={close} endpoint={endpoint} />
              )}
              contentClassName="min-w-[40rem]"
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Edit size={14} />
              Edit
            </DialogButton>
            <DialogButton
              content={(close) => (
                <DeleteConfirmationDialog
                  title="Delete Endpoint"
                  description="Are you sure you want to delete this endpoint? This action cannot be undone."
                  onConfirm={() => deleteEndpoint(endpoint.id)}
                  onCancel={close}
                  isLoading={isMutatingEndpoints}
                />
              )}
              size="sm"
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash size={14} />
              Delete
            </DialogButton>
          </div>
        </div>

        {/* Description, Schema, and Response Wrapper Info in One Row */}
        {(
          // endpoint.description ||
          endpoint.schema ||
          endpoint.responseWrapper) && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Description */}
            {/* {endpoint.description && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Description
                </h4>
                <p
                  className="text-muted-foreground text-sm leading-relaxed overflow-hidden text-ellipsis"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {endpoint.description}
                </p>
              </div>
            )} */}

            {/* Schema Info */}
            {endpoint.schema && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-500" />
                  Schema
                </h4>
                {/* TODO: after click, navigate to schemas page and open up the edit dialog */}
                <Badge variant="outline">
                  {endpoint.schema.name}
                </Badge>
              </div>
            )}

            {/* Response Wrapper Info */}
            {endpoint.responseWrapper && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <FileJson2 className="h-4 w-4 text-purple-500" />
                  Response Wrapper
                </h4>
                {/* TODO: after click, navigate to response wrappers page and open up the edit dialog */}
                <Badge variant="outline">
                  {endpoint.responseWrapper.name}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Sample Response */}
        <div>
          <h4 className="font-medium text-sm mb-2">Sample Response</h4>
          <JsonViewer
            data={EndpointService.getEndpointResponse(endpoint)}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
