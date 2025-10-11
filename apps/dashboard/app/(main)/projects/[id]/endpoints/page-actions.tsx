"use client";

import DialogButton from "@/components/dialog-button";
import EndpointCreationTabs from "@/components/endpoint/EndpointCreationTabs";
import EndpointGuide from "@/components/endpoint/EndpointGuide";
import { Plus, HelpCircle } from "lucide-react";

export function EndpointPageActions() {
  return (
    <div className="flex flex-col sm:flex-row gap-2 self-start lg:self-center w-full md:w-fit">
      <DialogButton
        content={<EndpointGuide />}
        title="API Endpoint Usage Guide"
        description="Learn how to create your first API, use dynamic parameters and query strings in your API endpoints"
        variant="outline"
        className="w-full md:w-fit"
      >
        <HelpCircle className="size-4 mr-2" />
        Usage Guide
      </DialogButton>
      
      <DialogButton
        content={(close) => <EndpointCreationTabs onSuccess={close} />}
        className="w-full md:w-fit"
      >
        <Plus className="size-4 mr-2" />
        Create Endpoint
      </DialogButton>
    </div>
  );
}
