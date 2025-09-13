"use client";

import { Card } from "@/components/ui/card";
import DialogButton from "@/components/dialog-button";
import ResponseWrapperForm from "./ResponseWrapperForm";
import ResponseWrapperView from "./ResponseWrapperView";
import DeleteConfirmationDialog from "@/components/delete-confirmation";
import { ResponseWrapper } from "@prisma/client";
import { Edit, Trash } from "lucide-react";
import { useMutationResponseWrapper } from "@/hooks/useResponseWrapper";

interface IResponseWrapperCardProps {
  wrapper: ResponseWrapper;
}
export default function ResponseWrapperCard({
  wrapper,
}: IResponseWrapperCardProps) {
  const { deleteResponseWrapper, isPending } = useMutationResponseWrapper();

  return (
    <Card key={wrapper.id} className="gap-3">
      <div className="flex justify-between items-center">
        <h2>{wrapper.name}</h2>
        <div className="flex items-center gap-2">
          <DialogButton
            content={(close) => (
              <ResponseWrapperForm
                responseWrapper={wrapper}
                onSuccess={close}
              />
            )}
            className="size-10 p-0"
            variant="outline"
          >
            <Edit size={16} />
          </DialogButton>
          <DialogButton
            content={(close) => (
              <DeleteConfirmationDialog
                title="Delete Endpoint"
                description="Are you sure you want to delete this endpoint?"
                onConfirm={() => deleteResponseWrapper(wrapper.id)}
                onCancel={close}
                isLoading={isPending}
              />
            )}
            className="size-10 p-2"
            variant="outline"
          >
            <Trash size={16} />
          </DialogButton>
        </div>
      </div>
      <ResponseWrapperView wrapper={wrapper} />
    </Card>
  );
}
