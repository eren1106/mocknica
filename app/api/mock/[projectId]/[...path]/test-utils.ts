import { NextResponse } from 'next/server';
import { HttpMethod, SchemaFieldType, IdFieldType } from '@prisma/client';

// Test factory utilities for creating mock data with proper types
export class TestDataFactory {
  static createMockProject(overrides = {}) {
    return {
      id: 'project-1',
      name: 'Test Project',
      description: 'Test project description',
      permission: 'PUBLIC' as const,
      isNeedToken: false,
      token: null,
      corsOrigins: [],
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      endpoints: [],
      schemas: [],
      responseWrappers: [],
      ...overrides,
    };
  }

  static createMockEndpoint(overrides = {}) {
    return {
      id: 'endpoint-1',
      name: 'Get Users',
      description: 'Get list of users',
      method: 'GET' as HttpMethod,
      path: '/users',
      staticResponse: { message: 'success', data: [{ id: 1, name: 'John' }] },
      schemaId: null,
      responseWrapperId: null,
      isDataList: false,
      numberOfData: null,
      projectId: 'project-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      schema: null,
      responseWrapper: null,
      ...overrides,
    };
  }

  static createMockSchema(overrides = {}) {
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
          type: SchemaFieldType.ID,
          idFieldType: IdFieldType.AUTOINCREMENT,
          schemaId: 1,
          fakerType: null,
          objectSchemaId: null,
          arrayTypeId: null,
          objectSchema: null,
          arrayType: null,
        },
        {
          id: 2,
          name: 'name',
          type: SchemaFieldType.STRING,
          idFieldType: null,
          schemaId: 1,
          fakerType: null,
          objectSchemaId: null,
          arrayTypeId: null,
          objectSchema: null,
          arrayType: null,
        },
      ],
      ...overrides,
    };
  }

  static createMockErrorResponse(message: string, statusCode: number) {
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}