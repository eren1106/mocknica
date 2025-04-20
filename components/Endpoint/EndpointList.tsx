"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Pencil, Trash } from "lucide-react";
import DialogButton from "../dialog-button";
import { useEndpoint } from "@/hooks/useEndpoint";
import { Endpoint } from "@prisma/client";
import EndpointForm from "./EndpointForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import DeleteConfirmationDialog from "../delete-confirmation";

interface EndpointsListProps {
  endpoints: Endpoint[];
}

export default function EndpointsList({ endpoints }: EndpointsListProps) {
  const { deleteEndpoint, isMutating } = useEndpoint();

  return (
    <div className="space-y-4">
      {endpoints.length < 1 ? (
        <p className="text-muted-foreground">No endpoints available</p>
      ) : (
        <Accordion type="multiple" className="w-full">
          {endpoints.map((endpoint) => (
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
              <AccordionContent>
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
                        isLoading={isMutating}
                      />
                    )}
                    className="size-10 p-2"
                    variant="outline"
                  >
                    <Trash size={20} />
                  </DialogButton>
                </div>
                <p className="mb-2">{endpoint.description}</p>
                <p className="font-mono p-2 rounded">{endpoint.path}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
