"use client";

import { Skeleton } from "@/components/ui/skeleton";
import DialogButton from "@/components/dialog-button";
import ResponseWrapperForm from "./ResponseWrapperForm";
import { Plus } from "lucide-react";
import { useResponseWrappers } from "@/hooks/useResponseWrapper";
import ResponseWrapperCard from "./ResponseWrapperCard";

interface ResponseWrappersPageContainerProps {
  projectId: string;
}
const ResponseWrappersPageContainer = ({ projectId }: ResponseWrappersPageContainerProps) => {
  const { data: responseWrappers, isLoading } = useResponseWrappers(projectId);

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
            <ResponseWrapperCard
              key={wrapper.id}
              wrapper={wrapper}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ResponseWrappersPageContainer;