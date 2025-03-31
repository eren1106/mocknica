import { SchemaService } from "@/services/schema.service";
import { Schema } from "@prisma/client";
import { toast } from "sonner";
import { create } from "zustand";

interface SchemaStore {
  schemas: Schema[];
  isLoading: boolean;
  fetchSchemas: () => Promise<void>;
//   createSchema: (data: Partial<Schema>) => Promise<void>;
//   updateSchema: (id: string, data: Partial<Schema>) => Promise<void>;
//   deleteSchema: (id: string) => Promise<void>;
}

export const useSchema = create<SchemaStore>((set, get) => ({
  schemas: [],
  isLoading: false,

  fetchSchemas: async () => {
    try {
      set({ isLoading: true });
      const schemas = await SchemaService.getAllSchemas();
      set({ schemas });
    } catch (error) {
      console.error('Error fetching schemas:', error);
      toast.error('Failed to fetch schemas');
    } finally {
      set({ isLoading: false });
    }
  },
}))