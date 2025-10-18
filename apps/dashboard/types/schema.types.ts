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
  id: number;
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

export interface ISchema {
  id: number;
  name: string;
  fields: ISchemaField[];
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}
