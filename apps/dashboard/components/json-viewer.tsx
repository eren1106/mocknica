"use client";

import React, { useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface JsonViewerProps {
  data: any;
  className?: string;
}

interface Token {
  type: string;
  value: string;
}

// Memoized JSON formatting function
const formatJSON = (jsonData: any): string => {
  try {
    return JSON.stringify(jsonData, null, 2);
  } catch (error) {
    return String(jsonData);
  }
};

// Memoized JSON tokenization function
const tokenizeJSON = (jsonString: string): Token[] => {
  const tokens: Token[] = [];
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
    } else if (jsonString.substring(i, 4) === 'true') {
      tokens.push({ type: 'boolean', value: 'true' });
      i += 4;
    } else if (jsonString.substring(i, 5) === 'false') {
      tokens.push({ type: 'boolean', value: 'false' });
      i += 5;
    } else if (jsonString.substring(i, 4) === 'null') {
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
  
  return tokens;
};

// Memoized token component to prevent unnecessary re-renders
const TokenSpan = React.memo(({ token, index }: { token: Token; index: number }) => {
  const getTokenClassName = (type: string): string => {
    switch (type) {
      case 'key':
        return "text-blue-700 dark:text-blue-300 font-medium";
      case 'string':
        return "text-green-600 dark:text-green-400 font-medium";
      case 'number':
        return "text-orange-600 dark:text-orange-400 font-medium";
      case 'boolean':
        return "text-purple-600 dark:text-purple-400 font-medium";
      case 'null':
        return "text-gray-500 dark:text-gray-400 font-medium";
      case 'punctuation':
        return "text-muted-foreground";
      default:
        return "";
    }
  };

  return (
    <span className={getTokenClassName(token.type)}>
      {token.value}
    </span>
  );
});

TokenSpan.displayName = 'TokenSpan';

// Memoized highlighted JSON component
const HighlightedJSON = React.memo(({ tokens }: { tokens: Token[] }) => {
  return (
    <>
      {tokens.map((token, index) => (
        <TokenSpan key={index} token={token} index={index} />
      ))}
    </>
  );
});

HighlightedJSON.displayName = 'HighlightedJSON';

const JsonViewer = React.memo(({ data, className }: JsonViewerProps) => {
  // Memoize the formatted JSON string - only recalculates when data changes
  const formattedJson = useMemo(() => formatJSON(data), [data]);
  
  // Memoize the tokenized JSON - only recalculates when formatted JSON changes
  const tokens = useMemo(() => tokenizeJSON(formattedJson), [formattedJson]);
  
  // Memoize the copy function to prevent unnecessary re-renders of the Button
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      toast.success("JSON copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy JSON");
    }
  }, [formattedJson]);

  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-3 right-5 z-10">
        <Button
          onClick={copyToClipboard}
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
      
      <pre className="p-4 rounded-lg overflow-auto max-h-96 bg-muted/30 border font-mono text-sm leading-relaxed">
        <code>
          <HighlightedJSON tokens={tokens} />
        </code>
      </pre>
    </div>
  );
});

JsonViewer.displayName = 'JsonViewer';

export default JsonViewer;