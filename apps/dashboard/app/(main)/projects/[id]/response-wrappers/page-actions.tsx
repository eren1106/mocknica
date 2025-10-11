"use client";

import DialogButton from "@/components/dialog-button";
import ResponseWrapperForm from "./_ui/ResponseWrapperForm";
import { Plus } from "lucide-react";

export function CreateResponseWrapperButton() {
  return (
    <DialogButton
      content={(close) => <ResponseWrapperForm onSuccess={close} />}
      className="w-fit self-start lg:self-center"
      contentClassName="min-w-[40rem]"
      title="Create Response Wrapper"
      description="Create a new response wrapper"
    >
      <Plus className="size-4 mr-2" />
      Create Response Wrapper
    </DialogButton>
  );
}
