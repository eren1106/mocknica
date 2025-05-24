"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DialogButton from "@/components/dialog-button";
import ResponseWrapperForm from "./ResponseWrapperForm";
import { Edit, Plus, Trash } from "lucide-react";
import DeleteConfirmationDialog from "@/components/delete-confirmation";
import ResponseWrapperView from "./ResponseWrapperView";
import { useResponseWrappers } from "@/hooks/useResponseWrapper";
import { useMutationResponseWrapper } from "@/hooks/useResponseWrapper";

const ResponseWrappersPageContainer = () => {
  const { data: responseWrappers, isLoading } = useResponseWrappers();
  const { deleteResponseWrapper, isPending } = useMutationResponseWrapper();

  return (
    <div className="container flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Response Wrappers</h1>
        <DialogButton
          content={(close) => <ResponseWrapperForm onSuccess={close} />}
          className="w-fit"
          contentClassName="min-w-[40rem]"
          title="Create Response Wrapper"
          description="Create a new response wrapper"
        >
          <Plus className="size-6 mr-2" />
          Create Response Wrapper
        </DialogButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Skeleton className="h-10" />
        ) : (
          responseWrappers?.map((wrapper) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default ResponseWrappersPageContainer;