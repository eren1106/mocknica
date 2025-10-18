import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SchemaService } from '../schema.service';
import { FakerService } from '../faker.service';
import { ISchema } from '@/types/schema.types';
import { ESchemaFieldType, EIdFieldType, EFakerType } from '@/types/enums';

// Mock the dependencies
vi.mock('../faker.service');

describe('SchemaService.generateResponseFromSchema', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(FakerService.generateFakerValue).mockImplementation((fakerType) => {
      switch (fakerType) {
        case EFakerType.FIRST_NAME:
          return 'John';
        case EFakerType.EMAIL:
          return 'john@example.com';
        case EFakerType.PHONE_NUMBER:
          return '+1234567890';
        case EFakerType.COMPANY_NAME:
          return 'Acme Corp';
        default:
          return 'mock-value';
      }
    });
  });

  it('should generate single object response for non-list endpoint', () => {
    // Arrange
    const mockSchema: ISchema = {
      id: 1,
      name: 'User',
      projectId: 'project1',
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
        {
          id: 3,
          name: 'email',
          type: ESchemaFieldType.FAKER,
          fakerType: EFakerType.EMAIL,
          schemaId: 1,
        }
      ]
    };

    // Act
    const result = SchemaService.generateResponseFromSchema(mockSchema, false);

    // Assert
    expect(result).toEqual({
      id: 1,
      name: 'string',
      email: 'john@example.com'
    });
    expect(FakerService.generateFakerValue).toHaveBeenCalledWith(EFakerType.EMAIL);
  });

  it('should generate array response for list endpoint with default count', () => {
    // Arrange
    const mockSchema: ISchema = {
      id: 1,
      name: 'User',
      projectId: 'project1',
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
          type: ESchemaFieldType.FAKER,
          fakerType: EFakerType.FIRST_NAME,
          schemaId: 1,
        },
      ]
    };

    // Act
    const result = SchemaService.generateResponseFromSchema(mockSchema, true);

    // Assert
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3); // Default count is 3
    expect(result[0]).toEqual({
      id: 1,
      name: 'John'
    });
    expect(result[1]).toEqual({
      id: 2,
      name: 'John'
    });
    expect(result[2]).toEqual({
      id: 3,
      name: 'John'
    });
    expect(FakerService.generateFakerValue).toHaveBeenCalledTimes(3);
    expect(FakerService.generateFakerValue).toHaveBeenCalledWith(EFakerType.FIRST_NAME);
  });

  it('should generate array response with custom numberOfData', () => {
    // Arrange
    const mockSchema: ISchema = {
      id: 1,
      name: 'User',
      projectId: 'project1',
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
      ]
    };

    // Act
    const result = SchemaService.generateResponseFromSchema(mockSchema, true, 5);

    // Assert
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({ id: 1 });
    expect(result[4]).toEqual({ id: 5 });
  });

  it('should handle all basic field types correctly', () => {
    // Arrange
    const mockSchema: ISchema = {
      id: 1,
      name: 'TestSchema',
      projectId: 'project1',
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 1,
          name: 'stringField',
          type: ESchemaFieldType.STRING,
          schemaId: 1,
        },
        {
          id: 2,
          name: 'integerField',
          type: ESchemaFieldType.INTEGER,
          schemaId: 1,
        },
        {
          id: 3,
          name: 'floatField',
          type: ESchemaFieldType.FLOAT,
          schemaId: 1,
        },
        {
          id: 4,
          name: 'booleanField',
          type: ESchemaFieldType.BOOLEAN,
          schemaId: 1,
        },
        {
          id: 5,
          name: 'dateField',
          type: ESchemaFieldType.DATE,
          schemaId: 1,
        },
        {
          id: 6,
          name: 'booleanField',
          type: ESchemaFieldType.BOOLEAN,
          schemaId: 1,
        },
        {
          id: 7,
          name: 'dateField',
          type: ESchemaFieldType.DATE,
          schemaId: 1,
        },
      ]
    };

    // Act
    const result = SchemaService.generateResponseFromSchema(mockSchema, false);

    // Assert
    expect(result.stringField).toBe('string');
    expect(result.integerField).toBe(1);
    expect(result.floatField).toBe(1.0);
    expect(result.booleanField).toBe(true);
    expect(result.dateField).toBeInstanceOf(Date);
  });

  it('should handle UUID ID field type correctly', () => {
    // Arrange
    const mockSchema: ISchema = {
      id: 1,
      name: 'User',
      projectId: 'project1',
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 1,
          name: 'id',
          type: ESchemaFieldType.ID,
          idFieldType: EIdFieldType.UUID,
          schemaId: 1,
        },
      ]
    };

    // Act
    const result = SchemaService.generateResponseFromSchema(mockSchema, false);

    // Assert
    expect(typeof result.id).toBe('string');
    expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});

describe('SchemaService.generateSchemaFieldValue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(FakerService.generateFakerValue).mockImplementation((fakerType) => {
      switch (fakerType) {
        case EFakerType.COMPANY_NAME:
          return 'Acme Corp';
        default:
          return 'mock-value';
      }
    });
  });

  it('should generate faker value when field type is FAKER', () => {
    // Arrange
    const field = {
      id: 1,
      name: 'company',
      type: ESchemaFieldType.FAKER,
      fakerType: EFakerType.COMPANY_NAME,
      schemaId: 1,
      objectType: null,
    };

    // Act
    const result = SchemaService.generateSchemaFieldValue(field);

    // Assert
    expect(result).toBe('Acme Corp');
    expect(FakerService.generateFakerValue).toHaveBeenCalledWith(EFakerType.COMPANY_NAME);
  });

  it('should return default values for basic types', () => {
    // Test STRING
    const stringField = {
      id: 1,
      name: 'test',
      type: ESchemaFieldType.STRING,
      schemaId: 1,
    };
    expect(SchemaService.generateSchemaFieldValue(stringField)).toBe('string');

    // Test INTEGER
    const intField = {
      ...stringField,
      type: ESchemaFieldType.INTEGER,
    };
    expect(SchemaService.generateSchemaFieldValue(intField)).toBe(1);

    // Test FLOAT
    const floatField = {
      ...stringField,
      type: ESchemaFieldType.FLOAT,
    };
    expect(SchemaService.generateSchemaFieldValue(floatField)).toBe(1.0);

    // Test BOOLEAN
    const booleanField = {
      ...stringField,
      type: ESchemaFieldType.BOOLEAN,
    };
    expect(SchemaService.generateSchemaFieldValue(booleanField)).toBe(true);

    // Test DATE
    const dateField = {
      ...stringField,
      type: ESchemaFieldType.DATE,
    };
    expect(SchemaService.generateSchemaFieldValue(dateField)).toBeInstanceOf(Date);
  });

  it('should handle ID field with custom dataId', () => {
    // Arrange
    const field = {
      id: 1,
      name: 'id',
      type: ESchemaFieldType.ID,
      idFieldType: EIdFieldType.AUTOINCREMENT,
      schemaId: 1,
    };

    // Act
    const result = SchemaService.generateSchemaFieldValue(field, 42);

    // Assert
    expect(result).toBe(42);
  });

  it('should return null for unknown field types', () => {
    // Arrange
    const field = {
      id: 1,
      name: 'unknown',
      type: 'UNKNOWN_TYPE' as ESchemaFieldType,
      schemaId: 1,
    };

    // Act
    const result = SchemaService.generateSchemaFieldValue(field);

    // Assert
    expect(result).toBeNull();
  });
});
