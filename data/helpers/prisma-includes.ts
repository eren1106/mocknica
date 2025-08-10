import { Prisma } from "@prisma/client";

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

// Type definitions for the includes
export type SchemaWithFields = Prisma.SchemaGetPayload<typeof PrismaIncludes.schemaInclude>;
export type EndpointWithRelations = Prisma.EndpointGetPayload<typeof PrismaIncludes.endpointInclude>;
export type ProjectWithRelations = Prisma.ProjectGetPayload<typeof PrismaIncludes.projectInclude>;
export type ProjectLight = Prisma.ProjectGetPayload<typeof PrismaIncludes.projectLightInclude>;
