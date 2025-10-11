import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EndpointService } from '../endpoint.service';
import { SchemaService } from '../schema.service';
import { ResponseWrapperService } from '../response-wrapper.service';
import { Endpoint } from '@/models/endpoint.model';
import { Schema } from '@/models/schema.model';
import { SchemaFieldType, IdFieldType, HttpMethod } from '@prisma/client';

// Mock the dependencies
vi.mock('../schema.service');
vi.mock('../response-wrapper.service');

describe('EndpointService.getEndpointResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when endpoint has schema', () => {
    it('should generate response from schema without wrapper', () => {
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
          }
        ]
      };

      const mockEndpoint: Endpoint = {
        id: '1',
        path: '/users',
        method: HttpMethod.GET,
        description: 'Get User',
        projectId: 'project1',
        schemaId: 1,
        schema: mockSchema,
        responseWrapperId: null,
        responseWrapper: null,
        staticResponse: null,
        isDataList: false,
        numberOfData: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockGeneratedResponse = { id: 1, name: 'John Doe' };

      vi.mocked(SchemaService.generateResponseFromSchema).mockReturnValue(mockGeneratedResponse);

      // Act
      const result = EndpointService.getEndpointResponse(mockEndpoint);

      // Assert
      expect(SchemaService.generateResponseFromSchema).toHaveBeenCalledWith(
        mockSchema,
        false,
        undefined
      );
      expect(result).toEqual(mockGeneratedResponse);
    });

    it('should generate list response from schema without wrapper', () => {
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
          }
        ]
      };

      const mockEndpoint: Endpoint = {
        id: '1',
        path: '/users',
        method: HttpMethod.GET,
        description: 'Get Users List',
        projectId: 'project1',
        schemaId: 1,
        schema: mockSchema,
        responseWrapperId: null,
        responseWrapper: null,
        staticResponse: null,
        isDataList: true,
        numberOfData: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockGeneratedResponse = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 }
      ];

      vi.mocked(SchemaService.generateResponseFromSchema).mockReturnValue(mockGeneratedResponse);

      // Act
      const result = EndpointService.getEndpointResponse(mockEndpoint);

      // Assert
      expect(SchemaService.generateResponseFromSchema).toHaveBeenCalledWith(
        mockSchema,
        true,
        5
      );
      expect(result).toEqual(mockGeneratedResponse);
    });

    it('should generate response from schema with wrapper', () => {
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
          }
        ]
      };

      const mockWrapper = {
        id: 1,
        name: 'Success Wrapper',
        projectId: 'project1',
        json: { success: true, data: '$data' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockEndpoint: Endpoint = {
        id: '1',
        path: '/users',
        method: HttpMethod.GET,
        description: 'Get User',
        projectId: 'project1',
        schemaId: 1,
        schema: mockSchema,
        responseWrapperId: 1,
        responseWrapper: mockWrapper,
        staticResponse: null,
        isDataList: false,
        numberOfData: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockGeneratedResponse = { id: 1 };
      const mockWrappedResponse = { success: true, data: { id: 1 } };

      vi.mocked(SchemaService.generateResponseFromSchema).mockReturnValue(mockGeneratedResponse);
      vi.mocked(ResponseWrapperService.generateResponseWrapperJson).mockReturnValue(mockWrappedResponse as any);

      // Act
      const result = EndpointService.getEndpointResponse(mockEndpoint);

      // Assert
      expect(SchemaService.generateResponseFromSchema).toHaveBeenCalledWith(
        mockSchema,
        false,
        undefined
      );
      expect(ResponseWrapperService.generateResponseWrapperJson).toHaveBeenCalledWith({
        response: mockGeneratedResponse,
        wrapper: mockWrapper,
      });
      expect(result).toEqual(mockWrappedResponse);
    });
  });

  describe('when endpoint has static response', () => {
    it('should return static response without wrapper', () => {
      // Arrange
      const mockStaticResponse = { message: 'Static response' };

      const mockEndpoint: Endpoint = {
        id: '1',
        path: '/static',
        method: HttpMethod.GET,
        description: 'Static response',
        projectId: 'project1',
        schemaId: null,
        schema: null,
        responseWrapperId: null,
        responseWrapper: null,
        staticResponse: mockStaticResponse,
        isDataList: false,
        numberOfData: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = EndpointService.getEndpointResponse(mockEndpoint);

      // Assert
      expect(result).toEqual(mockStaticResponse);
      expect(SchemaService.generateResponseFromSchema).not.toHaveBeenCalled();
      expect(ResponseWrapperService.generateResponseWrapperJson).not.toHaveBeenCalled();
    });

    it('should return static response with wrapper', () => {
      // Arrange
      const mockStaticResponse = { message: 'Static response' };
      const mockWrapper = {
        id: 1,
        name: 'Static Wrapper',
        projectId: 'project1',
        json: { success: true, data: '$data' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockEndpoint: Endpoint = {
        id: '1',
        path: '/static',
        method: HttpMethod.GET,
        description: 'Static response',
        projectId: 'project1',
        schemaId: null,
        schema: null,
        responseWrapperId: 1,
        responseWrapper: mockWrapper,
        staticResponse: mockStaticResponse,
        isDataList: false,
        numberOfData: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockWrappedResponse = { success: true, data: { message: 'Static response' } };

      vi.mocked(ResponseWrapperService.generateResponseWrapperJson).mockReturnValue(mockWrappedResponse as any);

      // Act
      const result = EndpointService.getEndpointResponse(mockEndpoint);

      // Assert
      expect(ResponseWrapperService.generateResponseWrapperJson).toHaveBeenCalledWith({
        response: mockStaticResponse,
        wrapper: mockWrapper,
      });
      expect(result).toEqual(mockWrappedResponse);
      expect(SchemaService.generateResponseFromSchema).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle endpoint with schema but isDataList true and no numberOfData', () => {
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
          }
        ]
      };

      const mockEndpoint: Endpoint = {
        id: '1',
        path: '/users',
        method: HttpMethod.GET,
        description: 'Get Users List',
        projectId: 'project1',
        schemaId: 1,
        schema: mockSchema,
        responseWrapperId: null,
        responseWrapper: null,
        staticResponse: null,
        isDataList: true,
        numberOfData: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(SchemaService.generateResponseFromSchema).mockReturnValue([]);

      // Act
      EndpointService.getEndpointResponse(mockEndpoint);

      // Assert
      expect(SchemaService.generateResponseFromSchema).toHaveBeenCalledWith(
        mockSchema,
        true,
        undefined
      );
    });
  });
});
