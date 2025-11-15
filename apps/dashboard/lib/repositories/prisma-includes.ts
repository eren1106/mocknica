/**
 * Centralized include configurations for Prisma queries
 * Reduces duplication and maintains consistent data fetching across the application
 */
export class PrismaIncludes {
  // Full schema includes (jsonSchema is a JSON column, no relations to include)
  static readonly schemaInclude = {} as const;

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
