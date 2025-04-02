"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useSchema } from "@/hooks/useSchema";
import { useEffect } from "react";
import SchemaCard from "./SchemaCard";

const SchemasPageContainer = () => {
  const { schemas, fetchSchemas, isLoading } = useSchema();

  useEffect(() => {
    fetchSchemas();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1>Schemas</h1>
      {isLoading ? (
        <Skeleton className="h-10" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {schemas.map((schema) => (
            <SchemaCard key={schema.id} schema={schema} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemasPageContainer;
