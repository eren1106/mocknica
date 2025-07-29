'use client'

import { Badge } from "@/components/ui/badge";
import { DATA_STR, WRAPPER_DATA_STR } from "@/constants";
import { formatJSON } from "@/lib/utils";
import React, { useCallback } from "react";
import { ResponseWrapper } from "@prisma/client";

const ResponseWrapperView = ({wrapper}: {wrapper: ResponseWrapper}) => {
  // Function to render JSON with Badge for DATA_STR
  const renderFormattedJson = useCallback(
    (json: any) => {
      const formattedJson = formatJSON(json);
      const parts = formattedJson.split(`"${WRAPPER_DATA_STR}"`);

      const elements: any[] = [];
      parts.forEach((part, index) => {
        // Add the text part with a key
        elements.push(<span key={`part-${index}`}>{part}</span>);

        // Add the Badge after each part except the last one
        if (index < parts.length - 1) {
          elements.push(
            <Badge
              key={`badge-${index}`}
              variant="default"
              className="rounded-sm"
            >
              {DATA_STR}
            </Badge>
          );
        }
      });

      return elements;
    },
    [formatJSON]
  );
  return (
    <pre className="p-4 rounded-md overflow-auto max-h-96 text-sm bg-secondary">
      <code className="whitespace-pre-wrap">
        {wrapper?.json ? renderFormattedJson(wrapper.json) : "No JSON"}
      </code>
    </pre>
  );
};

export default ResponseWrapperView;
