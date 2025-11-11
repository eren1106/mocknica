import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EndpointService } from '@/services/endpoint.service';
import { IEndpoint } from '@/types';
import { toast } from 'sonner';

export const ENDPOINTS_QUERY_KEY = 'endpoints';

export const useEndpoints = (projectId?: string) => {
  return useQuery<IEndpoint[]>({
    queryKey: [ENDPOINTS_QUERY_KEY, projectId],
    queryFn: () => EndpointService.getAllEndpoints(projectId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useMutationEndpoint = () => {
  const queryClient = useQueryClient();
  const invalidateQueries = () => queryClient.invalidateQueries({ queryKey: [ENDPOINTS_QUERY_KEY] });

  const createEndpoint = useMutation({ 
    mutationFn: (data: Partial<IEndpoint>) => EndpointService.createEndpoint(data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Endpoint created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create endpoint");
    },
  });

  const createBulkEndpoints = useMutation({
    mutationFn: (data: {
      projectId: string;
      schemas?: Array<{ name: string; fields: any[] }>;
      endpoints?: Partial<IEndpoint>[];
    }) => EndpointService.createBulkEndpoints(data),
    onSuccess: () => {
      invalidateQueries();
      // Toast notification handled by the caller (EndpointList.tsx)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create schemas and endpoints");
    },
  });

  const updateEndpoint = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IEndpoint> }) =>
      EndpointService.updateEndpoint(id, data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Endpoint updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update endpoint");
    },
  });
  const deleteEndpoint = useMutation({
    mutationFn: (id: string) => EndpointService.deleteEndpoint(id),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Endpoint deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete endpoint");
    },
  });
  const createEndpointsBySchema = useMutation({
    mutationFn: (data: { 
      schemaId: number; 
      basePath: string; 
      responseWrapperId?: number 
    }) => EndpointService.createEndpointsBySchema(data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Endpoints created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create endpoints");
    },
  });

  return {
    createEndpoint: createEndpoint.mutateAsync,
    createBulkEndpoints: createBulkEndpoints.mutateAsync,
    updateEndpoint: updateEndpoint.mutateAsync,
    deleteEndpoint: deleteEndpoint.mutateAsync,
    createEndpointsBySchema: createEndpointsBySchema.mutateAsync,
    isPending: createEndpoint.isPending || createBulkEndpoints.isPending || updateEndpoint.isPending || deleteEndpoint.isPending || createEndpointsBySchema.isPending,
  }
}