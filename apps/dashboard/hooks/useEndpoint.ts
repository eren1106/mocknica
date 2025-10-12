import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EndpointService } from '@/services/endpoint.service';
import { Endpoint } from '@/models/endpoint.model';
import { toast } from 'sonner';

export const ENDPOINTS_QUERY_KEY = 'endpoints';

export const useEndpoints = (projectId?: string) => {
  return useQuery<Endpoint[]>({
    queryKey: [ENDPOINTS_QUERY_KEY, projectId],
    queryFn: () => EndpointService.getAllEndpoints(projectId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useMutationEndpoint = () => {
  const queryClient = useQueryClient();
  const invalidateQueries = () => queryClient.invalidateQueries({ queryKey: [ENDPOINTS_QUERY_KEY] });

  const createEndpoint = useMutation({ 
    mutationFn: (data: Partial<Endpoint>) => EndpointService.createEndpoint(data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Endpoint created successfully");
    },
    onError: () => {
      toast.error("Failed to create endpoint");
    },
  });
  const updateEndpoint = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Endpoint> }) =>
      EndpointService.updateEndpoint(id, data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Endpoint updated successfully");
    },
    onError: () => {
      toast.error("Failed to update endpoint");
    },
  });
  const deleteEndpoint = useMutation({
    mutationFn: (id: string) => EndpointService.deleteEndpoint(id),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Endpoint deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete endpoint");
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
    onError: () => {
      toast.error("Failed to create endpoints");
    },
  });

  return {
    createEndpoint: createEndpoint.mutateAsync,
    updateEndpoint: updateEndpoint.mutateAsync,
    deleteEndpoint: deleteEndpoint.mutateAsync,
    createEndpointsBySchema: createEndpointsBySchema.mutateAsync,
    isPending: createEndpoint.isPending || updateEndpoint.isPending || deleteEndpoint.isPending || createEndpointsBySchema.isPending,
  }
}