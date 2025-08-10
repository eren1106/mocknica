import { z } from "zod";
import { WRAPPER_DATA_STR } from "@/constants";

export const ResponseWrapperSchema = z.object({
  name: z.string().min(1, "Name is required"),
  json: z.string().nullable().refine((val) => {
      if (!val || val.trim() === "") return true; // Allow empty or null values
          try {
          // Replace WRAPPER_DATA_STR with a valid JSON placeholder for validation
          const processedJson = val.replace(WRAPPER_DATA_STR, `"${WRAPPER_DATA_STR}"`);
          JSON.parse(processedJson);
          return true;
      } catch {
          return false;
      }
  }, {
      message: `JSON must be valid JSON format (${WRAPPER_DATA_STR} placeholder is allowed)`
  }),
});
export type ResponseWrapperSchemaType = z.infer<typeof ResponseWrapperSchema>;

export const CreateResponseWrapperSchema = ResponseWrapperSchema.extend({
  projectId: z.string().min(1, "Project ID is required"),
});
export type CreateResponseWrapperSchemaType = z.infer<
  typeof CreateResponseWrapperSchema
>;
