import EndpointsList from "@/components/endpoint/EndpointList";
import { EndpointPageActions } from "./endpoints/page-actions";

export default function EndpointsPage() {
  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">API Endpoints</h1>
          <p className="text-muted-foreground">
            Manage and test your API endpoints. Create, edit, and organize endpoints for your project.
          </p>
        </div>
        
        <EndpointPageActions />
      </div>

      <EndpointsList />
    </div>
  );
}
