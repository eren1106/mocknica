import { Prisma } from "@prisma/client";
import {
  ISchema,
  IEndpoint,
  IProject,
  IProjectLight,
} from "@/types";

// Centralized include configurations to reduce duplication
export class PrismaIncludes {
  // Schema field includes with nested relationships
  static readonly schemaFieldsInclude = {
    include: {
      objectSchema: {
        include: {
          fields: true,
        },
      },
      arrayType: {
        include: {
          objectSchema: {
            include: {
              fields: true,
            },
          },
        },
      },
    },
  } as const;

  // Full schema includes
  static readonly schemaInclude = {
    include: {
      fields: this.schemaFieldsInclude,
    },
  } as const;

  // Endpoint includes with schema and response wrapper
  static readonly endpointInclude = {
    include: {
      schema: this.schemaInclude,
      responseWrapper: true,
    },
  } as const;

  // Project includes with all related entities
  static readonly projectInclude = {
    include: {
      user: true,
      endpoints: this.endpointInclude,
      schemas: this.schemaInclude,
      responseWrappers: true,
    },
  } as const;

  // Light project includes without nested relationships (for performance)
  static readonly projectLightInclude = {
    include: {
      user: true,
      endpoints: true,
      schemas: true,
      responseWrappers: true,
    },
  } as const;

  // Endpoint light includes (without deeply nested schema fields)
  static readonly endpointLightInclude = {
    include: {
      schema: this.schemaInclude,
      responseWrapper: true,
    },
  } as const;
}

// Type definitions for the includes - now using frontend types
export type SchemaWithFields = ISchema;
export type EndpointWithRelations = IEndpoint;
export type ProjectWithRelations = IProject;
export type ProjectLight = IProjectLight;
