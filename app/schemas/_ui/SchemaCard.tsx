"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Schema } from "@/models/schema.model";
import { SchemaFieldType } from "@prisma/client";
import { Edit, Trash } from "lucide-react";
import DialogButton from "@/components/dialog-button";
import SchemaForm from "@/components/schema/SchemaForm";
import DeleteSchemaConfirmation from "./DeleteSchemaConfirmation";

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
      <CardContent>
        {schema.fields.map((field) => (
          <div className="flex items-center gap-2" key={field.id}>
            <p>{field.name}</p>
            <p>{field.type}</p>
            {field.type === SchemaFieldType.ID && <p>{field.idFieldType}</p>}
            {field.type === SchemaFieldType.FAKER && <p>{field.fakerType}</p>}
            {field.type === SchemaFieldType.OBJECT && (
              <p>{field.objectSchema ? field.objectSchema.name : "{}"}</p>
            )}
            {field.type === SchemaFieldType.ARRAY &&
              field.arrayType?.elementType === SchemaFieldType.OBJECT && (
                <p>
                  {field.arrayType?.objectSchema
                    ? field.arrayType.objectSchema.name
                    : "{}"}
                </p>
              )}
            {field.type === SchemaFieldType.ARRAY &&
              field.arrayType?.elementType === SchemaFieldType.FAKER && (
                <p>{field.arrayType?.fakerType}</p>
              )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SchemaCard;
