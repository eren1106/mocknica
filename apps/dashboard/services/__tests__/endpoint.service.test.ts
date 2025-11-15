import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EndpointService } from '../endpoint.service';
import { SchemaService } from '../schema.service';
import { ResponseWrapperService } from '../response-wrapper.service';
import { IEndpoint, ISchema, ESchemaFieldType, EIdFieldType, EHttpMethod } from '@/types';

// Mock the dependencies
vi.mock('../schema.service');
vi.mock('../response-wrapper.service');

describe('EndpointService.getEndpointResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when endpoint has schema', () => {
    it('should return static response without wrapper', () => {
      // Arrange
      const mockSchema: ISchema = {
        id: 1,
        name: 'User',
        projectId: 'project1',
        createdAt: new Date(),
        updatedAt: new Date(),
        fields: [
          {
            name: 'id',
            type: ESchemaFieldType.ID,
            idFieldType: EIdFieldType.AUTOINCREMENT,
          },
          {
            name: 'name',
            type: ESchemaFieldType.STRING,
          }
        ]
      };

      const mockStaticResponse = { id: 1, name: 'John Doe' };

      const mockEndpoint: IEndpoint = {
        id: '1',
        path: '/users',
        method: EHttpMethod.GET,
        description: 'Get User',
        projectId: 'project1',
        schemaId: 1,
        schema: mockSchema,
        staticResponse: mockStaticResponse,
        isDataList: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = EndpointService.getEndpointResponse(mockEndpoint);

      // Assert
      expect(SchemaService.generateResponseFromSchema).not.toHaveBeenCalled();
      expect(result).toEqual(mockStaticResponse);
    });

    it('should return list static response without wrapper', () => {
      // Arrange
      const mockSchema: ISchema = {
        id: 1,
        name: 'User',
        projectId: 'project1',
        createdAt: new Date(),
        updatedAt: new Date(),
        fields: [
          {
            name: 'id',
            type: ESchemaFieldType.ID,
            idFieldType: EIdFieldType.AUTOINCREMENT,
          }
        ]
      };

      const mockStaticResponse = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 }
      ];

      const mockEndpoint: IEndpoint = {
        id: '1',
        path: '/users',
        method: EHttpMethod.GET,
        description: 'Get Users List',
        projectId: 'project1',
        schemaId: 1,
        schema: mockSchema,
        responseWrapper: undefined,
        staticResponse: mockStaticResponse,
        isDataList: true,
        numberOfData: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = EndpointService.getEndpointResponse(mockEndpoint);

      // Assert
      expect(SchemaService.generateResponseFromSchema).not.toHaveBeenCalled();
      expect(result).toEqual(mockStaticResponse);
    });

    it('should return static response with wrapper', () => {
      // Arrange
      const mockSchema: ISchema = {
        id: 1,
        name: 'User',
        projectId: 'project1',
        createdAt: new Date(),
        updatedAt: new Date(),
        fields: [
          {
            name: 'id',
            type: ESchemaFieldType.ID,
            idFieldType: EIdFieldType.AUTOINCREMENT,
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

      const mockStaticResponse = { id: 1 };

      const mockEndpoint: IEndpoint = {
        id: '1',
        path: '/users',
        method: EHttpMethod.GET,
        description: 'Get User',
        projectId: 'project1',
        schemaId: 1,
        schema: mockSchema,
        responseWrapperId: 1,
        responseWrapper: mockWrapper,
        staticResponse: mockStaticResponse,
        isDataList: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockWrappedResponse = { success: true, data: { id: 1 } };

      vi.mocked(ResponseWrapperService.generateResponseWrapperJson).mockReturnValue(mockWrappedResponse as any);

      // Act
      const result = EndpointService.getEndpointResponse(mockEndpoint);

      // Assert
      expect(SchemaService.generateResponseFromSchema).not.toHaveBeenCalled();
      expect(ResponseWrapperService.generateResponseWrapperJson).toHaveBeenCalledWith({
        response: mockStaticResponse,
        wrapper: mockWrapper,
      });
      expect(result).toEqual(mockWrappedResponse);
    });
  });

  describe('when endpoint has static response', () => {
    it('should return static response without wrapper', () => {
      // Arrange
      const mockStaticResponse = { message: 'Static response' };

      const mockEndpoint: IEndpoint = {
        id: '1',
        path: '/static',
        method: EHttpMethod.GET,
        description: 'Static response',
        projectId: 'project1',
        schema: undefined,
        responseWrapper: undefined,
        staticResponse: mockStaticResponse,
        isDataList: false,
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

      const mockEndpoint: IEndpoint = {
        id: '1',
        path: '/static',
        method: EHttpMethod.GET,
        description: 'Static response',
        projectId: 'project1',
        schema: undefined,
        responseWrapperId: 1,
        responseWrapper: mockWrapper,
        staticResponse: mockStaticResponse,
        isDataList: false,
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
      const mockSchema: ISchema = {
        id: 1,
        name: 'User',
        projectId: 'project1',
        createdAt: new Date(),
        updatedAt: new Date(),
        fields: [
          {
            name: 'id',
            type: ESchemaFieldType.ID,
            idFieldType: EIdFieldType.AUTOINCREMENT,
          }
        ]
      };

      const mockStaticResponse: any[] = [];

      const mockEndpoint: IEndpoint = {
        id: '1',
        path: '/users',
        method: EHttpMethod.GET,
        description: 'Get Users List',
        projectId: 'project1',
        schemaId: 1,
        schema: mockSchema,
        responseWrapper: undefined,
        staticResponse: mockStaticResponse,
        isDataList: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = EndpointService.getEndpointResponse(mockEndpoint);

      // Assert
      expect(SchemaService.generateResponseFromSchema).not.toHaveBeenCalled();
      expect(result).toEqual(mockStaticResponse);
    });
  });
});
