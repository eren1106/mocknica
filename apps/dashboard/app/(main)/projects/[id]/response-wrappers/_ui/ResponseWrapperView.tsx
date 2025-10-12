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
        // Apply syntax highlighting to each part
        const highlightedPart = highlightJSON(part);
        elements.push(<span key={`part-${index}`}>{highlightedPart}</span>);

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
    []
  );

  // Function to highlight JSON syntax with colors matching JsonViewer
  // TODO: make i reusable with JsonViewer
  const highlightJSON = (jsonString: string): React.ReactNode => {
    // Split the JSON into tokens for safer parsing
    const tokens: { type: string; value: string }[] = [];
    let i = 0;
    
    while (i < jsonString.length) {
      const char = jsonString[i];
      
      if (char === '"') {
        // Handle strings
        let stringValue = '"';
        i++;
        while (i < jsonString.length && jsonString[i] !== '"') {
          if (jsonString[i] === '\\') {
            stringValue += jsonString[i] + (jsonString[i + 1] || '');
            i += 2;
          } else {
            stringValue += jsonString[i];
            i++;
          }
        }
        if (i < jsonString.length) {
          stringValue += '"';
          i++;
        }
        
        // Check if this string is a key (followed by :)
        let nextNonWhitespace = i;
        while (nextNonWhitespace < jsonString.length && /\s/.test(jsonString[nextNonWhitespace])) {
          nextNonWhitespace++;
        }
        
        const isKey = jsonString[nextNonWhitespace] === ':';
        tokens.push({ type: isKey ? 'key' : 'string', value: stringValue });
      } else if (/\d/.test(char) || (char === '-' && /\d/.test(jsonString[i + 1] || ''))) {
        // Handle numbers
        let numberValue = '';
        while (i < jsonString.length && /[\d\-\.]/.test(jsonString[i])) {
          numberValue += jsonString[i];
          i++;
        }
        tokens.push({ type: 'number', value: numberValue });
      } else if (jsonString.substr(i, 4) === 'true') {
        tokens.push({ type: 'boolean', value: 'true' });
        i += 4;
      } else if (jsonString.substr(i, 5) === 'false') {
        tokens.push({ type: 'boolean', value: 'false' });
        i += 5;
      } else if (jsonString.substr(i, 4) === 'null') {
        tokens.push({ type: 'null', value: 'null' });
        i += 4;
      } else if (/[{}[\],:]/.test(char)) {
        tokens.push({ type: 'punctuation', value: char });
        i++;
      } else {
        tokens.push({ type: 'whitespace', value: char });
        i++;
      }
    }
    
    // Render tokens with appropriate styling
    return tokens.map((token, index) => {
      switch (token.type) {
        case 'key':
          return (
            <span key={index} className="text-blue-700 dark:text-blue-300 font-medium">
              {token.value}
            </span>
          );
        case 'string':
          return (
            <span key={index} className="text-green-600 dark:text-green-400 font-medium">
              {token.value}
            </span>
          );
        case 'number':
          return (
            <span key={index} className="text-orange-600 dark:text-orange-400 font-medium">
              {token.value}
            </span>
          );
        case 'boolean':
          return (
            <span key={index} className="text-purple-600 dark:text-purple-400 font-medium">
              {token.value}
            </span>
          );
        case 'null':
          return (
            <span key={index} className="text-gray-500 dark:text-gray-400 font-medium">
              {token.value}
            </span>
          );
        case 'punctuation':
          return (
            <span key={index} className="text-muted-foreground">
              {token.value}
            </span>
          );
        default:
          return <span key={index}>{token.value}</span>;
      }
    });
  };
  return (
    <pre className="p-4 rounded-lg overflow-auto max-h-96 bg-muted/30 border font-mono text-sm leading-relaxed">
      <code className="whitespace-pre-wrap">
        {wrapper?.json ? renderFormattedJson(wrapper.json) : "No JSON"}
      </code>
    </pre>
  );
};

export default ResponseWrapperView;
