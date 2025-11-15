/**
 * Schema-related interfaces
 * These represent the structure for API schemas and their fields
 */

import { ESchemaFieldType, EIdFieldType, EFakerType } from "./enums";

export interface IArrayType {
  id: number;
  elementType: ESchemaFieldType;
  objectSchemaId?: number;
  objectSchema?: ISchema;
  fakerType?: EFakerType;
}

export interface ISchemaField {
  id?: number; // Optional for JSON schema fields
  name: string;
  type: ESchemaFieldType;
  idFieldType?: EIdFieldType;
  fakerType?: EFakerType;
  schemaId?: number;
  objectSchemaId?: number;
  objectSchema?: ISchema;
  arrayTypeId?: number;
  arrayType?: IArrayType;
}

// JSON Schema field format
export interface IJsonSchemaField {
  name: string;
  type: ESchemaFieldType;
  idFieldType?: EIdFieldType | null;
  fakerType?: EFakerType | null;
  objectSchemaId?: number | null;
  objectSchema?: ISchema; // Populated by backend enrichment
  arrayType?: {
    elementType: ESchemaFieldType;
    objectSchemaId?: number | null;
    objectSchema?: ISchema; // Populated by backend enrichment
    fakerType?: EFakerType | null;
  } | null;
}

export interface ISchema {
  id: number;
  name: string;
  jsonSchema?: IJsonSchemaField[]; // Optional for backward compatibility
  fields?: ISchemaField[]; // Deprecated: Use jsonSchema instead. Kept for backward compatibility
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}
