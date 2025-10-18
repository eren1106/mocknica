/**
 * Project-related interfaces
 * These represent projects, endpoints, and response wrappers
 */

import { EHttpMethod, EProjectPermission } from "./enums";
import { IUser } from "./entities";
import { ISchema } from "./schema.types";

export interface IResponseWrapper {
  id: number;
  name: string;
  json: any; // JSON value type
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEndpoint {
  id: string;
  description: string;
  method: EHttpMethod;
  path: string;
  staticResponse: any; // JSON value type
  schemaId?: number;
  schema?: ISchema;
  responseWrapperId?: number;
  responseWrapper?: IResponseWrapper;
  isDataList?: boolean | null;
  numberOfData?: number | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject {
  id: string;
  name: string;
  description?: string;
  permission: EProjectPermission;
  isNeedToken: boolean;
  token?: string;
  corsOrigins: string[];
  userId: string;
  user: IUser;
  endpoints: IEndpoint[];
  schemas: ISchema[];
  responseWrappers: IResponseWrapper[];
  createdAt: Date;
  updatedAt: Date;
}

// TODO: CHECK WHAT IS THIS
export interface IProjectLight {
  id: string;
  name: string;
  description?: string;
  permission: EProjectPermission;
  isNeedToken: boolean;
  token?: string;
  corsOrigins: string[];
  userId: string;
  user: IUser;
  endpoints: Array<{
    id: string;
    description: string;
    method: EHttpMethod;
    path: string;
    staticResponse: any;
    schemaId?: number;
    responseWrapperId?: number;
    isDataList?: boolean;
    numberOfData?: number;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  schemas: Array<{
    id: number;
    name: string;
    projectId?: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  responseWrappers: IResponseWrapper[];
  createdAt: Date;
  updatedAt: Date;
}
