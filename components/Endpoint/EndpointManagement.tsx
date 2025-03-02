'use client'

import React, { useEffect } from "react";
import EndpointsList from "./EndpointList";
import DialogButton from "../dialog-button";
import EndpointForm from "./EndpointForm";
import { Plus } from "lucide-react";
import { useEndpoint } from "@/hooks/useEndpoint";
import { Skeleton } from "../ui/skeleton";

const EndpointManagement = () => {
  const { endpoints, fetchEndpoints, isLoading } =
    useEndpoint();

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  return (
    <div className="container mx-auto p-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-center">Mock API Server</h1>
      <DialogButton
        content={(close) => <EndpointForm onSuccess={close} />}
        className="w-fit ml-auto"
      >
        <Plus className="size-6 mr-2" />
        Create Endpoint
      </DialogButton>
      <h2 className="text-2xl font-bold">Available Endpoints</h2>
      {
        isLoading ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-40" />
            <Skeleton className="w-full h-40" />
          </div>
        ) : <EndpointsList endpoints={endpoints} />
      }
    </div>
  );
};

export default EndpointManagement;
