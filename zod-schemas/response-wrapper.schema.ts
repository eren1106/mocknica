import { z } from "zod";

export const ResponseWrapperSchema = z.object({
    name: z.string().min(1, "Name is required"),
    json: z.string().nullable(),
});
export type ResponseWrapperSchemaType = z.infer<typeof ResponseWrapperSchema>;
