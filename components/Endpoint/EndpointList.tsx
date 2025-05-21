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
import { formatJSON } from "@/lib/utils";
import { EndpointService } from "@/services/endpoint.service";
import { useEndpoints, useMutationEndpoint } from "@/hooks/useEndpoint";
import { Skeleton } from "../ui/skeleton";

export default function EndpointsList() {
  const { data: endpoints, isLoading: isLoadingEndpoints } = useEndpoints();
  const { deleteEndpoint, isPending: isMutatingEndpoints } = useMutationEndpoint();

  if (isLoadingEndpoints) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-40" />
        <Skeleton className="w-full h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(endpoints?.length ?? 0) < 1 ? (
        <p className="text-muted-foreground">No endpoints available</p>
      ) : (
        <Accordion type="multiple" className="w-full">
          {endpoints?.map((endpoint) => (
            // Endpoint Item
            <AccordionItem value={endpoint.id} key={endpoint.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <p className="w-20 bg-secondary text-secondary-foreground p-2 rounded-[2px] font-semibold text-center">
                    {endpoint.method}
                  </p>
                  <p>{endpoint.path}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-2">
                <div className="flex items-center gap-2 justify-end">
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
                </div>
                <p className="">Name: {endpoint.name}</p>
                <p className="">Description: {endpoint.description}</p>
                <p className="">Path: {endpoint.path}</p>
                {
                  <>
                    {endpoint.schema && <p>Schema: {endpoint.schema.name}</p>}
                    <p>Response:</p>
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
