"use client";

import { useParams } from "next/navigation";
import SidebarSheet from "./SidebarSheet";
import { UserNav } from "../user-nav";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

const Topbar = () => {
  const params = useParams();
  const projectId = params?.id as string | undefined;

  const handleCopyUrl = async () => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/mock/${projectId}/`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy URL:", err);
      toast.error("Failed to copy URL");
    }
  };

  return (
    // INTERESTING ISSUE: if put bg-card here, the progressbar will have weird behavior (it will load with width of 100vw + sidebar width, which stop at the sidebar border)
    <div className="bg-card w-full md:w-[calc(100vw-var(--sidebar-width))] fixed top-0 z-50 h-[--topbar-height] border-b flex px-6 items-center gap-3">
      <SidebarSheet />
      {projectId && (
        <div className="flex items-center gap-3">
          <span className="hidden sm:block">API endpoint:</span>
          <div
            onClick={handleCopyUrl}
            className="text-primary text-ellipsis overflow-hidden whitespace-nowrap max-w-48 xs:max-w-full cursor-pointer"
          >
            {`${process.env.NEXT_PUBLIC_APP_URL}/api/mock/${projectId}/`}
            <Badge variant="secondary" className="rounded-sm text-md ml-1">
              endpoint
            </Badge>
          </div>
        </div>
      )}
      <div className="ml-auto">
        <UserNav />
      </div>
    </div>
  );
};

export default Topbar;
