import { create } from 'zustand';
import { Endpoint } from '@prisma/client';
import { toast } from 'sonner';

interface EndpointStore {
  endpoints: Endpoint[];
  isLoading: boolean;
  fetchEndpoints: () => Promise<void>;
  createEndpoint: (data: Partial<Endpoint>) => Promise<void>;
  updateEndpoint: (id: string, data: Partial<Endpoint>) => Promise<void>;
  deleteEndpoint: (id: string) => Promise<void>;
}

export const useEndpoint = create<EndpointStore>((set, get) => ({
  endpoints: [],
  isLoading: false,

  fetchEndpoints: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/endpoints');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      set({ endpoints: data });
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      toast.error('Failed to fetch endpoints');
    } finally {
      set({ isLoading: false });
    }
  },

  createEndpoint: async (data) => {
    try {
      const response = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      set((state) => ({ endpoints: [...state.endpoints, result] }));
      toast.success('Endpoint created successfully');
    } catch (error) {
      console.error('Error creating endpoint:', error);
      toast.error('Failed to create endpoint');
      throw error;
    }
  },

  updateEndpoint: async (id, data) => {
    try {
      const response = await fetch(`/api/endpoints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      set((state) => ({
        endpoints: state.endpoints.map((endpoint) =>
          endpoint.id === id ? { ...endpoint, ...result } : endpoint
        ),
      }));
      toast.success('Endpoint updated successfully');
    } catch (error) {
      console.error('Error updating endpoint:', error);
      toast.error('Failed to update endpoint');
      throw error;
    }
  },

  deleteEndpoint: async (id) => {
    try {
      const response = await fetch(`/api/endpoints/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      set((state) => ({
        endpoints: state.endpoints.filter((endpoint) => endpoint.id !== id),
      }));
      toast.success('Endpoint deleted successfully');
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      toast.error('Failed to delete endpoint');
      throw error;
    }
  },
}));