"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import DialogButton from "../dialog-button";
import { useEndpoint } from "@/hooks/useEndpoint";
import { Endpoint } from "@prisma/client";
import EndpointForm from "./EndpointForm";

interface EndpointsListProps {
  endpoints: Endpoint[];
}

export default function EndpointsList({ endpoints }: EndpointsListProps) {
  const { deleteEndpoint } = useEndpoint();

  return (
    <div className="space-y-4">
      {endpoints.length < 1 ? (
        <p className="text-muted-foreground">No endpoints available</p>
      ) : (
        endpoints.map((endpoint) => (
          <Card key={endpoint.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="px-2 py-1 rounded text-sm">
                  {endpoint.method}
                </span>
                <span>{endpoint.name}</span>
              </div>
              <div className="flex gap-2">
                <DialogButton
                  variant="outline"
                  size="icon"
                  content={(close) => (
                    <EndpointForm endpoint={endpoint} onSuccess={close} />
                  )}
                >
                  <Pencil className="size-4" />
                </DialogButton>
                <DialogButton
                  variant="outline"
                  size="icon"
                  content={(close) => (
                    <div>
                      <h2 className="text-xl font-bold">Are you sure?</h2>
                      <p>This action cannot be undone.</p>
                      <div className="flex justify-end gap-4">
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            await deleteEndpoint(endpoint.id);
                            close();
                          }}
                        >
                          Delete
                        </Button>
                        <Button variant="outline" onClick={close}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                >
                  <Trash className="size-4" />
                </DialogButton>
              </div>
            </div>
            <div>
              <p className="mb-2">{endpoint.description}</p>
              <p className="font-mono p-2 rounded">{endpoint.path}</p>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
