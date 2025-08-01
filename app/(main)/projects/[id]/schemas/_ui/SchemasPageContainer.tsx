"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";
import SchemaCard from "./SchemaCard";
import DialogButton from "@/components/dialog-button";
import SchemaForm from "@/components/schema/SchemaForm";
import { Plus } from "lucide-react";
import SearchBar from "@/components/searchbar";
import { useSchemas } from "@/hooks/useSchema";

interface SchemasPageContainerProps {
  projectId?: string;
}

const SchemasPageContainer = ({ projectId }: SchemasPageContainerProps) => {
  const { data: schemas, isLoading } = useSchemas(projectId);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchemas = useMemo(() => {
    return schemas?.filter((schema) => {
      return schema.name.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [];
  }, [schemas, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col gap-4">
      <h1>Schemas</h1>
      <div className="flex items-center gap-2">
        <SearchBar
          placeholder="Search schemas..."
          containerClassName="w-full"
          value={searchQuery}
          onChange={handleSearch}
          onClear={handleClearSearch}
        />
        <DialogButton
          content={(close) => <SchemaForm onSuccess={close} projectId={projectId} />}
          className="w-fit"
          title="Create Schema"
        >
          <Plus className="size-6 mr-2" />
          Create Schema
        </DialogButton>
      </div>
      {isLoading ? (
        <Skeleton className="h-10" />
      ) : (
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSchemas.map((schema) => (
            <SchemaCard key={schema.id} schema={schema} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemasPageContainer;
