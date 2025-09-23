"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink } from "lucide-react";
import { copyToClipboard, formatProjectEndpointBaseURL } from "@/lib/utils";
import { cn } from "@/lib/utils";
import LinkButton from "../link-button";

interface ProjectEndpointBaseUrlDisplayProps {
  projectId: string;
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "compact";
}

export const ProjectEndpointBaseUrlDisplay = ({
  projectId,
  className,
  showLabel = true,
  variant = "default",
}: ProjectEndpointBaseUrlDisplayProps) => {
  const endpoint = formatProjectEndpointBaseURL(projectId);

  const handleCopyUrl = () => {
    copyToClipboard(endpoint, "API endpoint copied to clipboard!");
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyUrl}
          className="h-8 px-2 text-xs"
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy API URL
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showLabel && (
        <span className="hidden sm:block text-sm text-muted-foreground font-medium">
          API endpoint:
        </span>
      )}
      <div className="flex items-center gap-2 min-w-0">
        <div
          onClick={handleCopyUrl}
          className={cn(
            "text-primary text-sm font-mono",
            "text-ellipsis overflow-hidden whitespace-nowrap max-w-48 xs:max-w-full",
            "cursor-pointer hover:text-primary/80 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleCopyUrl();
            }
          }}
          title="Click to copy"
        >
          {endpoint}
        </div>
        <Badge variant="secondary" className="text-xs">
          endpoint
        </Badge>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyUrl}
            className="h-6 w-6 p-0"
            title="Copy to clipboard"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <LinkButton
            href={endpoint}
            openNewTab
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            title="Open in new tab"
          >
            <ExternalLink className="w-3 h-3" />
          </LinkButton>
        </div>
      </div>
    </div>
  );
};