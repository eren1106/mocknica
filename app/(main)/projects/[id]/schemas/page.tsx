import SchemasList from "./_ui/SchemasList";
import { CreateSchemaButton } from "./page-actions";

export default function ProjectSchemasPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Data Schemas</h1>
          <p className="text-muted-foreground">
            Define and manage data structures for your API responses. Create reusable schemas to ensure consistent data formats.
          </p>
        </div>
        
        <CreateSchemaButton />
      </div>

      <SchemasList />
    </div>
  );
}
