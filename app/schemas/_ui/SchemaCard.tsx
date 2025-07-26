"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Schema } from "@/models/schema.model";
import { SchemaFieldType } from "@prisma/client";
import { Edit, Trash } from "lucide-react";
import DialogButton from "@/components/dialog-button";
import SchemaForm from "@/components/schema/SchemaForm";
import SchemaTooltip from "./SchemaTooltip";
import DeleteSchemaConfirmation from "./DeleteSchemaConfirmation";
import { convertEnumToTitleCase, formatJSON } from "@/lib/utils";
import { SchemaService } from "@/services/schema.service";
import { Badge } from "@/components/ui/badge";

const SchemaCard = ({ schema }: { schema: Schema }) => {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle>{schema.name}</CardTitle>
        <div className="flex flex-row gap-1">
          <DialogButton
            variant="outline"
            className="size-10 p-0"
            content={(close) => (
              <SchemaForm schema={schema} onSuccess={close} />
            )}
          >
            <Edit size={16} />
          </DialogButton>
          <DialogButton
            variant="outline"
            className="size-10 p-0"
            title="Delete Schema"
            description="Are you sure you want to delete this schema?"
            content={(close) => (
              <DeleteSchemaConfirmation id={schema.id} onClose={close} />
            )}
          >
            <Trash size={16} />
          </DialogButton>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          {schema.fields.map((field, index) => (
            <div className="flex items-center gap-2" key={index}>
              <p>{field.name}</p>
              <Badge variant="secondary">
                {convertEnumToTitleCase(field.type)}
              </Badge>
              {field.type === SchemaFieldType.ID && field.idFieldType && (
                <Badge variant="secondary">
                  {convertEnumToTitleCase(field.idFieldType)}
                </Badge>
              )}
              {field.type === SchemaFieldType.FAKER && field.fakerType && (
                <Badge variant="secondary">
                  {convertEnumToTitleCase(field.fakerType)}
                </Badge>
              )}
              {field.type === SchemaFieldType.OBJECT &&
                (field.objectSchema ? (
                  <SchemaTooltip objectSchema={field.objectSchema} />
                ) : (
                  <Badge variant="secondary">{"{}"}</Badge>
                ))}
              {field.type === SchemaFieldType.ARRAY &&
                field.arrayType?.elementType === SchemaFieldType.OBJECT &&
                (field.arrayType?.objectSchema ? (
                  <SchemaTooltip objectSchema={field.arrayType.objectSchema} />
                ) : (
                  <Badge variant="secondary">{"{}"}</Badge>
                ))}
              {field.type === SchemaFieldType.ARRAY &&
                field.arrayType?.elementType === SchemaFieldType.FAKER && (
                  <p>{field.arrayType?.fakerType}</p>
                )}
            </div>
          ))}
        </div>
        <pre className="p-4 rounded-md overflow-auto max-h-96 text-sm bg-secondary">
          <code className="">
            {formatJSON(SchemaService.generateResponseFromSchema(schema))}
          </code>
        </pre>
      </CardContent>
    </Card>
  );
};

export default SchemaCard;
