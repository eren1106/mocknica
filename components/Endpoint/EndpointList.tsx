"use client";

import { Edit, Trash } from "lucide-react";
import DialogButton from "../dialog-button";
import EndpointForm from "./EndpointForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import DeleteConfirmationDialog from "../delete-confirmation";
import { cn, formatJSON } from "@/lib/utils";
import { EndpointService } from "@/services/endpoint.service";
import { useEndpoints, useMutationEndpoint } from "@/hooks/useEndpoint";
import { Skeleton } from "../ui/skeleton";

export default function EndpointsList() {
  const { data: endpoints, isLoading: isLoadingEndpoints } = useEndpoints();
  const { deleteEndpoint, isPending: isMutatingEndpoints } =
    useMutationEndpoint();

  if (isLoadingEndpoints) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-40" />
        <Skeleton className="w-full h-40" />
      </div>
    );
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-500 dark:bg-green-600";
      case "POST":
        return "bg-yellow-500 dark:bg-yellow-600";
      case "PUT":
        return "bg-blue-500 dark:bg-blue-600";
      case "DELETE":
        return "bg-red-500 dark:bg-red-600";
      default:
        return "bg-muted";
    }
  };

  return (
    <div>
      {(endpoints?.length ?? 0) < 1 ? (
        <p className="text-muted-foreground">No endpoints available</p>
      ) : (
        <Accordion type="multiple" className="w-full flex flex-col gap-2">
          {endpoints?.map((endpoint) => (
            // Endpoint Item
            <AccordionItem
              value={endpoint.id}
              key={endpoint.id}
              className="border-none"
            >
              <AccordionTrigger className="hover:no-underline border border-muted rounded-md p-4 data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
                <div className="flex items-center gap-2 w-full mr-3">
                  <p
                    className={cn(
                      "w-20 p-2 rounded-[2px] font-semibold text-center text-white",
                      getMethodColor(endpoint.method)
                    )}
                  >
                    {endpoint.method}
                  </p>
                  <p>{endpoint.path}</p>
                  <p className="text-muted-foreground">{endpoint.name}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-2 border border-muted rounded-md p-4 pt-0 border-t-0 rounded-t-none -mt-px">
                <div className="flex items-center justify-end gap-2">
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
                    <Trash size={20} />
                  </DialogButton>
                  <DialogButton
                    content={(close) => (
                      <EndpointForm onSuccess={close} endpoint={endpoint} />
                    )}
                    contentClassName="min-w-[40rem]"
                    className="size-10 p-2"
                    variant="outline"
                  >
                    <Edit size={20} />
                  </DialogButton>
                </div>
                {endpoint.description && <p className="text-muted-foreground">{endpoint.description}</p>}
                {
                  <>
                    {endpoint.schema && <p>Schema: {endpoint.schema.name}</p>}
                    {/* <p>Response:</p> */}
                    <pre className="p-4 rounded-md overflow-auto max-h-96 text-sm bg-secondary">
                      <code className="">
                        {formatJSON(
                          EndpointService.getEndpointResponse(endpoint)
                        )}
                      </code>
                    </pre>
                  </>
                }
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
