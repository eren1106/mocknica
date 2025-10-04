import ResponseWrappersList from "./_ui/ResponseWrappersList";
import { CreateResponseWrapperButton } from "./page-actions";

export default function ProjectResponseWrappersPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Response Wrappers</h1>
          <p className="text-muted-foreground">
            Create consistent response formats for your API endpoints. Standardize how data, metadata, and pagination are structured in your responses.
          </p>
        </div>
        
        <CreateResponseWrapperButton />
      </div>

      <ResponseWrappersList />
    </div>
  );
}
