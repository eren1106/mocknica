"use client";

import EndpointsList from "@/components/endpoint/EndpointList";
import DialogButton from "../dialog-button";
import EndpointGuide from "./EndpointGuide";
import { HelpCircle, Plus, Sparkles } from "lucide-react";
import EndpointCreationTabs from "./EndpointCreationTabs";
import AIGenerationDialog from "./AIGenerationDialog";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { aiGeneratedDataAtom } from "@/atoms/aiGenerationAtom";

export default function EndpointsPageContent() {
  const [aiGeneratedData] = useAtom(aiGeneratedDataAtom);

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">API Endpoints</h1>
          <p className="text-muted-foreground">
            Manage and test your API endpoints. Create, edit, and organize
            endpoints for your project.
          </p>
        </div>

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

          <>
            <DialogButton
              variant="default"
              size="default"
              className={cn(
                "w-full md:w-fit gap-2",
                "bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 text-white hover:from-purple-600 hover:to-blue-600 dark:hover:from-purple-700 dark:hover:to-blue-700",
                "hover:shadow-lg hover:shadow-purple-500/50",
                "text-white font-semibold"
              )}
              title="Generate with AI ✨"
              description="Create multiple endpoints and schemas using AI"
              content={(close) => (
                <AIGenerationDialog
                  onClose={close}
                />
              )}
              disabled={!!aiGeneratedData}
            >
              <Sparkles className="h-4 w-4" />
              AI Generate
            </DialogButton>
          </>
        </div>
      </div>

      <EndpointsList />
    </div>
  );
}
