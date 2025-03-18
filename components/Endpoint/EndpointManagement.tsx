"use client";

import React, { useEffect } from "react";
import DialogButton from "../dialog-button";
import { Plus } from "lucide-react";
import { useEndpoint } from "@/hooks/useEndpoint";
import { Skeleton } from "../ui/skeleton";
import EndpointsList from "./EndpointList";
import EndpointForm from "./EndpointForm";
import SchemaForm from "../schema/SchemaForm";

const EndpointManagement = () => {
  const { endpoints, fetchEndpoints, isLoading } = useEndpoint();

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-end gap-2 items-center">
        <DialogButton
          content={(close) => <EndpointForm onSuccess={close} />}
          className="w-fit"
        >
          <Plus className="size-6 mr-2" />
          Create Endpoint
        </DialogButton>
        <DialogButton
          content={(close) => <SchemaForm onSuccess={close} />}
          className="w-fit"
          contentClassName="min-w-[40rem]"
        >
          <Plus className="size-6 mr-2" />
          Create Schema
        </DialogButton>
      </div>
      <h2 className="text-2xl font-bold mb-3">Available Endpoints</h2>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="w-full h-40" />
          <Skeleton className="w-full h-40" />
        </div>
      ) : (
        <EndpointsList endpoints={endpoints} />
      )}
    </div>
  );
};

export default EndpointManagement;
