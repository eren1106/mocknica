import { NextResponse } from 'next/server';
import { EHttpMethod, ESchemaFieldType, EIdFieldType, EProjectPermission } from '@/types';
import type { IProject, IEndpoint, ISchema } from '@/types';

// Test factory utilities for creating mock data with proper types
export class TestDataFactory {
  static createMockProject(overrides: Partial<IProject> = {}): IProject {
    return {
      id: 'project-1',
      name: 'Test Project',
      description: 'Test project description',
      permission: EProjectPermission.PUBLIC,
      isNeedToken: false,
      corsOrigins: [],
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      endpoints: [],
      schemas: [],
      responseWrappers: [],
      ...overrides,
    };
  }

  static createMockEndpoint(overrides: Partial<IEndpoint> = {}): IEndpoint {
    return {
      id: 'endpoint-1',
      description: 'Get list of users',
      method: EHttpMethod.GET,
      path: '/users',
      staticResponse: { message: 'success', data: [{ id: 1, name: 'John' }] },
      isDataList: false,
      projectId: 'project-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMockSchema(overrides: Partial<ISchema> = {}): ISchema {
    return {
      id: 1,
      name: 'User',
      projectId: 'project-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 1,
          name: 'id',
          type: ESchemaFieldType.ID,
          idFieldType: EIdFieldType.AUTOINCREMENT,
          schemaId: 1,
        },
        {
          id: 2,
          name: 'name',
          type: ESchemaFieldType.STRING,
          schemaId: 1,
        },
      ],
      ...overrides,
    };
  }

  static createMockErrorResponse(message: string, statusCode: number) {
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}