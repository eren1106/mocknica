import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SchemaService } from "@/services/schema.service";
import { Schema } from "@/models/schema.model";
import { SchemaSchemaType } from "@/zod-schemas/schema.schema";
import { toast } from "sonner";

const SCHEMAS_QUERY_KEY = "schemas";

export const useSchemas = (projectId: string) => {
  return useQuery<Schema[]>({
    queryKey: [SCHEMAS_QUERY_KEY, projectId],
    queryFn: () => SchemaService.getAllSchemas(projectId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useMutationSchema = () => {
  const queryClient = useQueryClient();
  const invalidateQueries = () =>
    queryClient.invalidateQueries({ queryKey: [SCHEMAS_QUERY_KEY] });

  const createSchema = useMutation({
    mutationFn: (data: SchemaSchemaType & { projectId?: string }) =>
      SchemaService.createSchema(data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Schema created successfully");
    },
    onError: () => {
      toast.error("Failed to create schema");
    },
  });

  const updateSchema = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SchemaSchemaType }) =>
      SchemaService.updateSchema(id, data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Schema updated successfully");
    },
    onError: () => {
      toast.error("Failed to update schema");
    },
  });

  const deleteSchema = useMutation({
    mutationFn: (id: number) => SchemaService.deleteSchema(id),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Schema deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete schema");
    },
  });

  return {
    createSchema: createSchema.mutateAsync,
    updateSchema: updateSchema.mutateAsync,
    deleteSchema: deleteSchema.mutateAsync,
    isPending:
      createSchema.isPending ||
      updateSchema.isPending ||
      deleteSchema.isPending,
  };
};
