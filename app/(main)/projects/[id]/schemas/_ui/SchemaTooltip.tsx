"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { convertEnumToTitleCase } from "@/lib/utils";
import { SchemaFieldType } from "@prisma/client";

interface SchemaField {
  name: string;
  type: SchemaFieldType;
}

interface ObjectSchema {
  name: string;
  fields?: SchemaField[];
}

interface SchemaTooltipProps {
  objectSchema: ObjectSchema;
  className?: string;
}

const SchemaTooltip = ({ objectSchema, className }: SchemaTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="secondary" className={`cursor-help ${className}`}>
          {objectSchema.name}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="">
          <div className="font-semibold mb-1">{objectSchema.name}</div>
          {objectSchema.fields && objectSchema.fields.length > 0 ? (
            objectSchema.fields.map((objField, objIndex) => (
              <div key={objIndex} className="text-xs">
                {objField.name}: {convertEnumToTitleCase(objField.type)}
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">
              No fields defined
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default SchemaTooltip;
