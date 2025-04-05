import { Schema } from "@/models/schema.model";
import { SchemaService } from "@/services/schema.service";
import { SchemaSchemaType } from "@/zod-schemas/schema.schema";
import { toast } from "sonner";
import { create } from "zustand";

interface SchemaStore {
  schemas: Schema[];
  isLoading: boolean;
  isMutating: boolean;
  fetchSchemas: () => Promise<void>;
  createSchema: (data: SchemaSchemaType) => Promise<void>;
  updateSchema: (id: number, data: SchemaSchemaType) => Promise<void>;
  deleteSchema: (id: number) => Promise<void>;
}

export const useSchema = create<SchemaStore>((set, get) => ({
  schemas: [],
  isLoading: false,
  isMutating: false,

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

  createSchema: async (data: SchemaSchemaType) => {
    try {
      set({ isMutating: true });
      const newSchema = await SchemaService.createSchema(data);
      set((state) => ({ schemas: [...state.schemas, newSchema] }));
      toast.success('Schema created successfully');
    } catch (error) {
      console.error('Error creating schema:', error);
      toast.error('Failed to create schema');
    } finally {
      set({ isMutating: false });
    }
  },

  updateSchema: async (id: number, data: SchemaSchemaType) => {
    try {
      set({ isMutating: true });
      await SchemaService.updateSchema(id, data);
      set((state) => ({ schemas: state.schemas.map((s) => (s.id === id ? { ...s, ...data } : s)) }));
      toast.success('Schema updated successfully');
    } catch (error) {
      console.error('Error updating schema:', error);
      toast.error('Failed to update schema');
    } finally {
      set({ isMutating: false });
    }
  },

  deleteSchema: async (id: number) => {
    try {
      set({ isMutating: true });
      await SchemaService.deleteSchema(id);
      set((state) => ({ schemas: state.schemas.filter((s) => s.id !== id) }));
      toast.success('Schema deleted successfully');
    } catch (error) {
      console.error('Error deleting schema:', error);
      toast.error('Failed to delete schema');
    } finally {
      set({ isMutating: false });
    }
  }
}))