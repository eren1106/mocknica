import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SchemaService } from '../schema.service';
import { FakerService } from '../faker.service';
import { Schema } from '@/models/schema.model';
import { SchemaField } from '@/models/schema-field.model';
import { SchemaFieldType, IdFieldType, FakerType } from '@prisma/client';

// Mock the dependencies
vi.mock('../faker.service');

describe('SchemaService.generateResponseFromSchema', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(FakerService.generateFakerValue).mockImplementation((fakerType) => {
      switch (fakerType) {
        case FakerType.FIRST_NAME:
          return 'John';
        case FakerType.EMAIL:
          return 'john@example.com';
        case FakerType.PHONE_NUMBER:
          return '+1234567890';
        case FakerType.COMPANY_NAME:
          return 'Acme Corp';
        default:
          return 'mock-value';
      }
    });
  });

  it('should generate single object response for non-list endpoint', () => {
    // Arrange
    const mockSchema: Schema = {
      id: 1,
      name: 'User',
      projectId: 'project1',
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
          objectType: null,
        } as SchemaField,
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
          objectType: null,
        } as SchemaField,
        {
          id: 3,
          name: 'email',
          type: SchemaFieldType.FAKER,
          fakerType: FakerType.EMAIL,
          idFieldType: null,
          schemaId: 1,
          objectSchemaId: null,
          arrayTypeId: null,
          objectSchema: null,
          arrayType: null,
          objectType: null,
        } as SchemaField,
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
    expect(FakerService.generateFakerValue).toHaveBeenCalledWith(FakerType.EMAIL);
  });

  it('should generate array response for list endpoint with default count', () => {
    // Arrange
    const mockSchema: Schema = {
      id: 1,
      name: 'User',
      projectId: 'project1',
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
          objectType: null,
        } as SchemaField,
        {
          id: 2,
          name: 'name',
          type: SchemaFieldType.FAKER,
          fakerType: FakerType.FIRST_NAME,
          idFieldType: null,
          schemaId: 1,
          objectSchemaId: null,
          arrayTypeId: null,
          objectSchema: null,
          arrayType: null,
          objectType: null,
        } as SchemaField,
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
    expect(FakerService.generateFakerValue).toHaveBeenCalledWith(FakerType.FIRST_NAME);
  });

  it('should generate array response with custom numberOfData', () => {
    // Arrange
    const mockSchema: Schema = {
      id: 1,
      name: 'User',
      projectId: 'project1',
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
          objectType: null,
        } as SchemaField,
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
    const mockSchema: Schema = {
      id: 1,
      name: 'TestSchema',
      projectId: 'project1',
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 1,
          name: 'stringField',
          type: SchemaFieldType.STRING,
          idFieldType: null,
          schemaId: 1,
          fakerType: null,
          objectSchemaId: null,
          arrayTypeId: null,
          objectSchema: null,
          arrayType: null,
          objectType: null,
        } as SchemaField,
        {
          id: 2,
          name: 'integerField',
          type: SchemaFieldType.INTEGER,
          idFieldType: null,
          schemaId: 1,
          fakerType: null,
          objectSchemaId: null,
          arrayTypeId: null,
          objectSchema: null,
          arrayType: null,
          objectType: null,
        } as SchemaField,
        {
          id: 3,
          name: 'floatField',
          type: SchemaFieldType.FLOAT,
          idFieldType: null,
          schemaId: 1,
          fakerType: null,
          objectSchemaId: null,
          arrayTypeId: null,
          objectSchema: null,
          arrayType: null,
          objectType: null,
        } as SchemaField,
        {
          id: 4,
          name: 'booleanField',
          type: SchemaFieldType.BOOLEAN,
          idFieldType: null,
          schemaId: 1,
          fakerType: null,
          objectSchemaId: null,
          arrayTypeId: null,
          objectSchema: null,
          arrayType: null,
          objectType: null,
        } as SchemaField,
        {
          id: 5,
          name: 'dateField',
          type: SchemaFieldType.DATE,
          idFieldType: null,
          schemaId: 1,
          fakerType: null,
          objectSchemaId: null,
          arrayTypeId: null,
          objectSchema: null,
          arrayType: null,
          objectType: null,
        } as SchemaField,
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
    const mockSchema: Schema = {
      id: 1,
      name: 'User',
      projectId: 'project1',
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 1,
          name: 'id',
          type: SchemaFieldType.ID,
          idFieldType: IdFieldType.UUID,
          schemaId: 1,
          fakerType: null,
          objectSchemaId: null,
          arrayTypeId: null,
          objectSchema: null,
          arrayType: null,
          objectType: null,
        } as SchemaField,
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
        case FakerType.COMPANY_NAME:
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
      type: SchemaFieldType.FAKER,
      fakerType: FakerType.COMPANY_NAME,
      idFieldType: null,
      schemaId: 1,
      objectSchemaId: null,
      arrayTypeId: null,
      objectSchema: null,
      arrayType: null,
      objectType: null,
    } as SchemaField;

    // Act
    const result = SchemaService.generateSchemaFieldValue(field);

    // Assert
    expect(result).toBe('Acme Corp');
    expect(FakerService.generateFakerValue).toHaveBeenCalledWith(FakerType.COMPANY_NAME);
  });

  it('should return default values for basic types', () => {
    // Test STRING
    const stringField = {
      id: 1,
      name: 'test',
      type: SchemaFieldType.STRING,
      fakerType: null,
      idFieldType: null,
      schemaId: 1,
      objectSchemaId: null,
      arrayTypeId: null,
      objectSchema: null,
      arrayType: null,
      objectType: null,
    } as SchemaField;
    expect(SchemaService.generateSchemaFieldValue(stringField)).toBe('string');

    // Test INTEGER
    const intField = {
      ...stringField,
      type: SchemaFieldType.INTEGER,
    } as SchemaField;
    expect(SchemaService.generateSchemaFieldValue(intField)).toBe(1);

    // Test FLOAT
    const floatField = {
      ...stringField,
      type: SchemaFieldType.FLOAT,
    } as SchemaField;
    expect(SchemaService.generateSchemaFieldValue(floatField)).toBe(1.0);

    // Test BOOLEAN
    const booleanField = {
      ...stringField,
      type: SchemaFieldType.BOOLEAN,
    } as SchemaField;
    expect(SchemaService.generateSchemaFieldValue(booleanField)).toBe(true);

    // Test DATE
    const dateField = {
      ...stringField,
      type: SchemaFieldType.DATE,
    } as SchemaField;
    expect(SchemaService.generateSchemaFieldValue(dateField)).toBeInstanceOf(Date);
  });

  it('should handle ID field with custom dataId', () => {
    // Arrange
    const field = {
      id: 1,
      name: 'id',
      type: SchemaFieldType.ID,
      idFieldType: IdFieldType.AUTOINCREMENT,
      fakerType: null,
      schemaId: 1,
      objectSchemaId: null,
      arrayTypeId: null,
      objectSchema: null,
      arrayType: null,
      objectType: null,
    } as SchemaField;

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
      type: 'UNKNOWN_TYPE' as SchemaFieldType,
      fakerType: null,
      idFieldType: null,
      schemaId: 1,
      objectSchemaId: null,
      arrayTypeId: null,
      objectSchema: null,
      arrayType: null,
      objectType: null,
    } as SchemaField;

    // Act
    const result = SchemaService.generateSchemaFieldValue(field);

    // Assert
    expect(result).toBeNull();
  });
});
