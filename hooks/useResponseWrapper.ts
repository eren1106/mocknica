import { ResponseWrapperService } from "@/services/response-wrapper.service";
import { ResponseWrapper } from "@prisma/client";
import { toast } from "sonner";
import { create } from "zustand";

interface ResponseWrapperStore {
    responseWrappers: ResponseWrapper[];
    isLoading: boolean;
    isMutating: boolean;
    fetchResponseWrappers: () => Promise<void>;
    createResponseWrapper: (data: Partial<ResponseWrapper>) => Promise<void>;
    updateResponseWrapper: (id: number, data: Partial<ResponseWrapper>) => Promise<void>;
    deleteResponseWrapper: (id: number) => Promise<void>;
}

export const useResponseWrapper = create<ResponseWrapperStore>((set, get) => ({ 
    responseWrappers: [],
    isLoading: false,
    isMutating: false,
    fetchResponseWrappers: async () => {
        try {
            set({ isLoading: true });
            const responseWrappers = await ResponseWrapperService.getAllResponseWrappers();
            set({ responseWrappers });
        } catch (error) {
            console.error('Error fetching response wrappers:', error);
            toast.error('Failed to fetch response wrappers');
        } finally {
            set({ isLoading: false });
        }
    },
    
    createResponseWrapper: async (data) => {
        try {
            set({ isMutating: true });
            const responseWrapper = await ResponseWrapperService.createResponseWrapper(data);
            set({ responseWrappers: [...get().responseWrappers, responseWrapper] });
            toast.success('Response wrapper created successfully');
        } catch (error) {
            console.error('Error creating response wrapper:', error);
            toast.error('Failed to create response wrapper');
        } finally {
            set({ isMutating: false });
        }
    },

    updateResponseWrapper: async (id, data) => {
        try {
            set({ isMutating: true });
            await ResponseWrapperService.updateResponseWrapper(id, data);
            set((state) => ({
                responseWrappers: state.responseWrappers.map((responseWrapper) => responseWrapper.id === id ? { ...responseWrapper, ...data } : responseWrapper)
            }))
            toast.success('Response wrapper updated successfully');
        } catch (error) {
            console.error('Error updating response wrapper:', error);
            toast.error('Failed to update response wrapper');
        } finally {
            set({ isMutating: false });
        }
    },

    deleteResponseWrapper: async (id) => {
        try {
            set({ isMutating: true });
            await ResponseWrapperService.deleteResponseWrapper(id);
            set((state) => ({ responseWrappers: state.responseWrappers.filter((responseWrapper) => responseWrapper.id !== id) }));
            toast.success('Response wrapper deleted successfully');
        } catch (error) {
            console.error('Error deleting response wrapper:', error);
            toast.error('Failed to delete response wrapper');
        } finally {
            set({ isMutating: false });
        }
    },
}));
  
