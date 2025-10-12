import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResponseWrapperService } from '@/services/response-wrapper.service';
import { ResponseWrapper } from '@prisma/client';
import { toast } from 'sonner';
import { ENDPOINTS_QUERY_KEY } from './useEndpoint';

const RESPONSE_WRAPPERS_QUERY_KEY = 'response-wrappers';

export const useResponseWrappers = (projectId: string) => {
  return useQuery<ResponseWrapper[]>({
    queryKey: [RESPONSE_WRAPPERS_QUERY_KEY, projectId],
    queryFn: () => ResponseWrapperService.getAllResponseWrappers(projectId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useResponseWrapper = ({ id, projectId }: { id: number; projectId: string }) => {
  return useQuery<ResponseWrapper>({
    queryKey: [RESPONSE_WRAPPERS_QUERY_KEY, projectId, id],
    // TODO: need to pass in projectId as well to validate
    queryFn: () => ResponseWrapperService.getResponseWrapperById(id),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!id,
  });
};

export const useMutationResponseWrapper = () => {
  const queryClient = useQueryClient();
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: [RESPONSE_WRAPPERS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [ENDPOINTS_QUERY_KEY] }); // refetch endpoints as well to reflect the changes immediately
  };

  const createResponseWrapper = useMutation({ 
    mutationFn: (data: Partial<ResponseWrapper>) => ResponseWrapperService.createResponseWrapper(data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Response wrapper created successfully");
    },
  });

  const updateResponseWrapper = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ResponseWrapper> }) =>
      ResponseWrapperService.updateResponseWrapper(id, data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Response wrapper updated successfully");
    },
  });

  const deleteResponseWrapper = useMutation({
    mutationFn: (id: number) => ResponseWrapperService.deleteResponseWrapper(id),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Response wrapper deleted successfully");
    },
  });

  return {
    createResponseWrapper: createResponseWrapper.mutateAsync,
    updateResponseWrapper: updateResponseWrapper.mutateAsync,
    deleteResponseWrapper: deleteResponseWrapper.mutateAsync,
    isPending: createResponseWrapper.isPending || updateResponseWrapper.isPending || deleteResponseWrapper.isPending,
  }
}