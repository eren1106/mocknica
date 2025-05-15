import { create } from 'zustand';
import { toast } from 'sonner';
import { Endpoint } from '@/models/endpoint.model';
import { EndpointService } from '@/services/endpoint.service';

interface EndpointStore {
  endpoints: Endpoint[];
  isLoading: boolean;
  isMutating: boolean;
  fetchEndpoints: () => Promise<void>;
  createEndpoint: (data: Partial<Endpoint>) => Promise<void>;
  updateEndpoint: (id: string, data: Partial<Endpoint>) => Promise<void>;
  deleteEndpoint: (id: string) => Promise<void>;
}

export const useEndpoint = create<EndpointStore>((set, get) => ({
  endpoints: [],
  isLoading: false,
  isMutating: false,

  fetchEndpoints: async () => {
    try {
      set({ isLoading: true });
      const endpoints = await EndpointService.getAllEndpoints();
      set({ endpoints });
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      toast.error('Failed to fetch endpoints');
    } finally {
      set({ isLoading: false });
    }
  },

  createEndpoint: async (data) => {
    try {
      set({ isMutating: true });
      const response = await EndpointService.createEndpoint(data);
      
      // TODO: fix update state not working
      set((state) => ({ endpoints: [...state.endpoints, response] }));
      toast.success('Endpoint created successfully');
    } catch (error) {
      console.error('Error creating endpoint:', error);
      toast.error('Failed to create endpoint');
      throw error;
    }
    finally {
      set({ isMutating: false });
    }
  },

  updateEndpoint: async (id, data) => {
    try {
      set({ isMutating: true });
      const res = await EndpointService.updateEndpoint(id, data);

      // TODO: fix update state not working
      set((state) => ({
        endpoints: state.endpoints.map((endpoint) =>
          endpoint.id === id ? { ...endpoint, ...res } : endpoint
        ),
      }));
      toast.success('Endpoint updated successfully');
    } catch (error) {
      console.error('Error updating endpoint:', error);
      toast.error('Failed to update endpoint');
      throw error;
    }
    finally {
      set({ isMutating: false });
    }
  },

  deleteEndpoint: async (id) => {
    try {
      set({ isMutating: true });
      await EndpointService.deleteEndpoint(id);

      set((state) => ({
        endpoints: state.endpoints.filter((endpoint) => endpoint.id !== id),
      }));
      toast.success('Endpoint deleted successfully');
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      toast.error('Failed to delete endpoint');
      throw error;
    }
    finally {
      set({ isMutating: false });
    }
  },
}));