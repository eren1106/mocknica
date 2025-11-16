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

// JSON Schema field format
export interface ISchemaField {
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
  fields?: ISchemaField[];
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}
