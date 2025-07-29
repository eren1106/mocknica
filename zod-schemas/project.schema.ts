import { ProjectPermission } from "@prisma/client";
import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  permission: z.nativeEnum(ProjectPermission),
});

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;

// Validation functions
export const validateProject = (data: unknown) => ProjectSchema.safeParse(data);
export const validateProjectStrict = (data: unknown) => ProjectSchema.parse(data);
