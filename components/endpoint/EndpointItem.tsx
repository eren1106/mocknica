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
import { Copy, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { useMutationEndpoint } from "@/hooks/useEndpoint";
import { EndpointService } from "@/services/endpoint.service";
import { useCurrentProjectId } from "@/hooks/useCurrentProject";

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
      default:
        return "border border-muted-foreground text-muted-foreground bg-muted/10";
    }
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
      <AccordionTrigger className="bg-background hover:no-underline border border-muted rounded-md p-4 data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
        <div className="flex items-center gap-2 w-full mr-3">
          <p
            className={cn(
              "w-20 p-2 rounded-[2px] font-semibold text-center",
              getMethodColor(endpoint.method)
            )}
          >
            {endpoint.method}
          </p>
          <p className="font-bold">{endpoint.path}</p>
          <p className="text-muted-foreground">{endpoint.description}</p>
        </div>
      </AccordionTrigger>
      <AccordionContent className="bg-background flex flex-col gap-2 border border-muted rounded-md p-4 pt-0 border-t-0 rounded-t-none -mt-px">
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => copyEndpointUrl(endpoint)}
            className="size-10 p-2"
            variant="outline"
          >
            <Copy size={16} />
          </Button>
          <DialogButton
            content={(close) => (
              <DeleteConfirmationDialog
                title="Delete Endpoint"
                description="Are you sure you want to delete this endpoint?"
                onConfirm={() => deleteEndpoint(endpoint.id)}
                onCancel={close}
                isLoading={isMutatingEndpoints}
              />
            )}
            className="size-10 p-2"
            variant="outline"
          >
            <Trash size={16} />
          </DialogButton>
          <DialogButton
            content={(close) => (
              <EndpointForm onSuccess={close} endpoint={endpoint} />
            )}
            contentClassName="min-w-[40rem]"
            className="size-10 p-2"
            variant="outline"
          >
            <Edit size={16} />
          </DialogButton>
        </div>
        {endpoint.description && (
          <p className="text-muted-foreground">{endpoint.description}</p>
        )}
        {
          <>
            {endpoint.schema && <p>Schema: {endpoint.schema.name}</p>}
            <JsonViewer
              data={EndpointService.getEndpointResponse(endpoint)}
              className="mt-2"
            />
          </>
        }
      </AccordionContent>
    </AccordionItem>
  );
}
