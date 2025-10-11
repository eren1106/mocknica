"use client";

import DialogButton from "@/components/dialog-button";
import SchemaForm from "@/components/schema/SchemaForm";
import { Plus } from "lucide-react";

export function CreateSchemaButton() {
  return (
    <DialogButton
      content={(close) => <SchemaForm onSuccess={close} />}
      className="w-fit self-start lg:self-center"
      title="Create Schema"
    >
      <Plus className="size-4 mr-2" />
      Create Schema
    </DialogButton>
  );
}
