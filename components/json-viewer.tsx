"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface JsonViewerProps {
  data: any;
  className?: string;
}

const formatJSON = (jsonData: any): string => {
  try {
    return JSON.stringify(jsonData, null, 2);
  } catch (error) {
    return String(jsonData);
  }
};

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

export default function JsonViewer({ data, className }: JsonViewerProps) {
  const copyToClipboard = async () => {
    try {
      const jsonString = formatJSON(data);
      await navigator.clipboard.writeText(jsonString);
      toast.success("JSON copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy JSON");
    }
  };

  const formattedJson = formatJSON(data);

  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-2 right-2 z-10">
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
          {highlightJSON(formattedJson)}
        </code>
      </pre>
    </div>
  );
}
