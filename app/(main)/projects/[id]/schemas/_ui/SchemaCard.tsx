"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Schema } from "@/models/schema.model";
import { SchemaFieldType } from "@prisma/client";
import { Edit, Trash, Database, Hash, Calendar, Code } from "lucide-react";
import DialogButton from "@/components/dialog-button";
import SchemaForm from "@/components/schema/SchemaForm";
import SchemaTooltip from "./SchemaTooltip";
import DeleteSchemaConfirmation from "./DeleteSchemaConfirmation";
import { convertEnumToTitleCase, formatJSON } from "@/lib/utils";
import { SchemaService } from "@/services/schema.service";
import { Badge } from "@/components/ui/badge";
import JsonViewer from "@/components/json-viewer";

const SchemaCard = ({ schema }: { schema: Schema }) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  // TODO: dont hard-code color
  const getFieldTypeColor = (type: SchemaFieldType) => {
    switch (type) {
      case SchemaFieldType.STRING:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800";
      case SchemaFieldType.INTEGER:
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800";
      case SchemaFieldType.FLOAT:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800";
      case SchemaFieldType.BOOLEAN:
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-800";
      case SchemaFieldType.OBJECT:
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-300 dark:border-orange-800";
      case SchemaFieldType.ARRAY:
        return "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/20 dark:text-pink-300 dark:border-pink-800";
      case SchemaFieldType.ID:
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300 dark:border-yellow-800";
      case SchemaFieldType.FAKER:
        return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-300 dark:border-cyan-800";
      case SchemaFieldType.DATE:
        return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-300 dark:border-violet-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-300 dark:border-gray-800";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-muted hover:border-border">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {schema.name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <span>
                  {schema.fields.length} field
                  {schema.fields.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(schema.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DialogButton
              variant="outline"
              size="sm"
              className="size-8 p-0"
              content={(close) => (
                <SchemaForm schema={schema} onSuccess={close} />
              )}
            >
              <Edit size={14} />
            </DialogButton>
            <DialogButton
              variant="outline"
              size="sm"
              className="size-8 p-0"
              title="Delete Schema"
              description="Are you sure you want to delete this schema?"
              content={(close) => (
                <DeleteSchemaConfirmation id={schema.id} onClose={close} />
              )}
            >
              <Trash size={14} />
            </DialogButton>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Schema Fields */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Schema Fields</h4>
          </div>

          {schema.fields.length > 0 ? (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {schema.fields.map((field, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-sm text-foreground">
                    {field.name}
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    <Badge
                      variant="outline"
                      className={getFieldTypeColor(field.type)}
                    >
                      {convertEnumToTitleCase(field.type)}
                    </Badge>
                    {field.type === SchemaFieldType.ID && field.idFieldType && (
                      // TODO: dont hard-code color
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300"
                      >
                        {convertEnumToTitleCase(field.idFieldType)}
                      </Badge>
                    )}
                    {field.type === SchemaFieldType.FAKER &&
                      field.fakerType && (
                        // TODO: dont hard-code color
                        <Badge
                          variant="outline"
                          className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-300"
                        >
                          {convertEnumToTitleCase(field.fakerType)}
                        </Badge>
                      )}
                    {field.type === SchemaFieldType.OBJECT &&
                      (field.objectSchema ? (
                        <SchemaTooltip objectSchema={field.objectSchema} />
                      ) : (
                        <Badge
                          variant="outline"
                          className={getFieldTypeColor(field.type)}
                        >
                          {"{}"}
                        </Badge>
                      ))}
                    {field.type === SchemaFieldType.ARRAY &&
                      field.arrayType?.elementType === SchemaFieldType.OBJECT &&
                      (field.arrayType?.objectSchema ? (
                        <SchemaTooltip
                          objectSchema={field.arrayType.objectSchema}
                        />
                      ) : (
                        <Badge
                          variant="outline"
                          className={getFieldTypeColor(field.type)}
                        >
                          {"{}"}
                        </Badge>
                      ))}
                    {field.type === SchemaFieldType.ARRAY &&
                      field.arrayType?.elementType ===
                        SchemaFieldType.FAKER && (
                        // TODO: dont hard-code color
                        <Badge
                          variant="outline"
                          className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-300"
                        >
                          {field.arrayType?.fakerType}
                        </Badge>
                      )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No fields defined yet
            </div>
          )}
        </div>

        {/* Sample Response */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Sample Response</h4>
          </div>
          <JsonViewer data={SchemaService.generateResponseFromSchema(schema)} />
        </div>
      </CardContent>
    </Card>
  );
};

export default SchemaCard;
