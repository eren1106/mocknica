import { 
  Endpoint, 
  Schema, 
  SchemaField, 
  ArrayType, 
  ResponseWrapper, 
  Project,
  User,
  HttpMethod,
  SchemaFieldType,
  IdFieldType,
  FakerType,
  ProjectPermission
} from "@prisma/client";
import {
  IEndpoint,
  ISchema,
  ISchemaField,
  IArrayType,
  IResponseWrapper,
  IProject,
  IProjectLight,
  IUser,
  EHttpMethod,
  ESchemaFieldType,
  EIdFieldType,
  EFakerType,
  EProjectPermission
} from "@/types";

/**
 * Type mappers to convert Prisma entities to application domain types
 * This abstraction layer allows us to decouple database schema from application types
 */

// Enum mappers
export const mapHttpMethod = (method: HttpMethod): EHttpMethod => {
  return method as unknown as EHttpMethod;
};

export const mapSchemaFieldType = (type: SchemaFieldType): ESchemaFieldType => {
  return type as unknown as ESchemaFieldType;
};

export const mapIdFieldType = (type: IdFieldType | null): EIdFieldType | null => {
  return type as unknown as EIdFieldType | null;
};

export const mapFakerType = (type: FakerType | null): EFakerType | null => {
  return type as unknown as EFakerType | null;
};

export const mapProjectPermission = (permission: ProjectPermission): EProjectPermission => {
  return permission as unknown as EProjectPermission;
};

// Entity mappers
export const mapUser = (user: User): IUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image ?? undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const mapArrayType = (arrayType: ArrayType & { objectSchema: Schema & { fields: SchemaField[] } | null }): IArrayType => {
  return {
    id: arrayType.id,
    elementType: mapSchemaFieldType(arrayType.elementType),
    objectSchemaId: arrayType.objectSchemaId ?? undefined,
    objectSchema: arrayType.objectSchema ? mapSchema(arrayType.objectSchema) : undefined,
    fakerType: mapFakerType(arrayType.fakerType) ?? undefined,
  };
};

export const mapSchemaField = (
  field: SchemaField & { 
    objectSchema?: (Schema & { fields: SchemaField[] }) | null;
    arrayType?: (ArrayType & { objectSchema: (Schema & { fields: SchemaField[] }) | null }) | null;
  }
): ISchemaField => {
  return {
    id: field.id,
    name: field.name,
    type: mapSchemaFieldType(field.type),
    idFieldType: mapIdFieldType(field.idFieldType) ?? undefined,
    fakerType: mapFakerType(field.fakerType) ?? undefined,
    objectSchemaId: field.objectSchemaId ?? undefined,
    arrayTypeId: field.arrayTypeId ?? undefined,
    schemaId: field.schemaId ?? undefined,
    objectSchema: field.objectSchema ? mapSchema(field.objectSchema) : undefined,
    arrayType: field.arrayType ? mapArrayType(field.arrayType) : undefined,
  };
};

export const mapSchema = (
  schema: Schema & { 
    fields?: SchemaField[] | (SchemaField & {
      objectSchema?: (Schema & { fields: SchemaField[] }) | null;
      arrayType?: (ArrayType & { objectSchema: (Schema & { fields: SchemaField[] }) | null }) | null;
    })[]
  }
): ISchema => {
  return {
    id: schema.id,
    name: schema.name,
    projectId: schema.projectId ?? undefined,
    fields: schema.fields?.map(mapSchemaField) ?? [],
    createdAt: schema.createdAt,
    updatedAt: schema.updatedAt,
  };
};

export const mapResponseWrapper = (wrapper: ResponseWrapper): IResponseWrapper => {
  return {
    id: wrapper.id,
    name: wrapper.name,
    json: wrapper.json,
    projectId: wrapper.projectId,
    createdAt: wrapper.createdAt,
    updatedAt: wrapper.updatedAt,
  };
};

export const mapEndpoint = (
  endpoint: Endpoint & {
    schema?: (Schema & { fields: SchemaField[] }) | null;
    responseWrapper?: ResponseWrapper | null;
  }
): IEndpoint => {
  return {
    id: endpoint.id,
    path: endpoint.path,
    method: mapHttpMethod(endpoint.method),
    description: endpoint.description,
    schemaId: endpoint.schemaId ?? undefined,
    isDataList: endpoint.isDataList ?? undefined,
    numberOfData: endpoint.numberOfData ?? undefined,
    staticResponse: endpoint.staticResponse,
    responseWrapperId: endpoint.responseWrapperId ?? undefined,
    projectId: endpoint.projectId,
    createdAt: endpoint.createdAt,
    updatedAt: endpoint.updatedAt,
    schema: endpoint.schema ? mapSchema(endpoint.schema) : undefined,
    responseWrapper: endpoint.responseWrapper ? mapResponseWrapper(endpoint.responseWrapper) : undefined,
  };
};

export const mapProject = (
  project: Project & {
    user?: User;
    endpoints?: (Endpoint & {
      schema?: (Schema & { fields: SchemaField[] }) | null;
      responseWrapper?: ResponseWrapper | null;
    })[];
    schemas?: (Schema & { fields: SchemaField[] })[];
    responseWrappers?: ResponseWrapper[];
  }
): IProject => {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? undefined,
    permission: mapProjectPermission(project.permission),
    isNeedToken: project.isNeedToken,
    token: project.token ?? undefined,
    corsOrigins: project.corsOrigins,
    userId: project.userId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    user: project.user ? mapUser(project.user) : {} as IUser,
    endpoints: project.endpoints ? project.endpoints.map(mapEndpoint) : [],
    schemas: project.schemas ? project.schemas.map(mapSchema) : [],
    responseWrappers: project.responseWrappers ? project.responseWrappers.map(mapResponseWrapper) : [],
  };
};

export const mapProjectLight = (
  project: Project & {
    user?: User;
    endpoints?: Endpoint[];
    schemas?: Schema[];
    responseWrappers?: ResponseWrapper[];
  }
): IProjectLight => {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? undefined,
    permission: mapProjectPermission(project.permission),
    isNeedToken: project.isNeedToken,
    token: project.token ?? undefined,
    corsOrigins: project.corsOrigins,
    userId: project.userId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    user: project.user ? mapUser(project.user) : {} as IUser,
    endpoints: project.endpoints ? project.endpoints.map(e => ({
      id: e.id,
      description: e.description,
      method: mapHttpMethod(e.method),
      path: e.path,
      staticResponse: e.staticResponse,
      schemaId: e.schemaId ?? undefined,
      responseWrapperId: e.responseWrapperId ?? undefined,
      isDataList: e.isDataList ?? undefined,
      numberOfData: e.numberOfData ?? undefined,
      projectId: e.projectId,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })) : [],
    schemas: project.schemas ? project.schemas.map(s => ({
      id: s.id,
      name: s.name,
      projectId: s.projectId ?? undefined,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })) : [],
    responseWrappers: project.responseWrappers ? project.responseWrappers.map(mapResponseWrapper) : [],
  };
};
