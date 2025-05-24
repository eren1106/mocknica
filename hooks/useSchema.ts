import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SchemaService } from '@/services/schema.service';
import { Schema } from '@/models/schema.model';
import { SchemaSchemaType } from '@/zod-schemas/schema.schema';
import { toast } from 'sonner';

const SCHEMAS_QUERY_KEY = 'schemas';

export const useSchemas = () => {
  return useQuery<Schema[]>({
    queryKey: [SCHEMAS_QUERY_KEY],
    queryFn: SchemaService.getAllSchemas,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useMutationSchema = () => {
  const queryClient = useQueryClient();
  const invalidateQueries = () => queryClient.invalidateQueries({ queryKey: [SCHEMAS_QUERY_KEY] });

  const createSchema = useMutation({ 
    mutationFn: (data: SchemaSchemaType) => SchemaService.createSchema(data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Schema created successfully");
    },
  });

  const updateSchema = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SchemaSchemaType }) =>
      SchemaService.updateSchema(id, data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Schema updated successfully");
    },
  });

  const deleteSchema = useMutation({
    mutationFn: (id: number) => SchemaService.deleteSchema(id),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Schema deleted successfully");
    },
  });

  return {
    createSchema: createSchema.mutateAsync,
    updateSchema: updateSchema.mutateAsync,
    deleteSchema: deleteSchema.mutateAsync,
    isPending: createSchema.isPending || updateSchema.isPending || deleteSchema.isPending,
  }
}