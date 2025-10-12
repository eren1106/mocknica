import ProjectList from "@/components/project/ProjectList";
import { CreateProjectButton } from "./page-actions";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Organize your APIs into projects. Each project can contain endpoints, schemas, and response wrappers.
          </p>
        </div>
        
        <CreateProjectButton />
      </div>

      <ProjectList />
    </div>
  );
}
