import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST, PUT, DELETE, PATCH } from './route';
import { ProjectData } from '@/data/project.data';
import { EndpointData } from '@/data/endpoint.data';
import { EndpointService } from '@/services/endpoint.service';
import { QueryParamsHelper } from '@/helpers/query-params';
import { errorResponse } from '../../../_helpers/api-response';
import { TestDataFactory } from './test-utils';

// Mock all dependencies
vi.mock('@/data/project.data');
vi.mock('@/data/endpoint.data');
vi.mock('@/services/endpoint.service');
vi.mock('@/helpers/query-params');
vi.mock('../../../_helpers/api-response');

// Mock console methods to avoid noise in tests
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Mock API Route Handler', () => {
  const mockProject = TestDataFactory.createMockProject();
  const mockEndpoint = TestDataFactory.createMockEndpoint();

  const mockParams = {
    projectId: 'project-1',
    path: ['users']
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful mocks
    vi.mocked(ProjectData.getProject).mockResolvedValue(mockProject);
    vi.mocked(EndpointData.getEndpoints).mockResolvedValue([mockEndpoint]);
    vi.mocked(EndpointService.getEndpointResponse).mockReturnValue({
      message: 'success',
      data: [{ id: 1, name: 'John' }]
    });
    vi.mocked(QueryParamsHelper.parseQueryParams).mockReturnValue({});
    
    // Mock errorResponse to return proper NextResponse
    vi.mocked(errorResponse).mockImplementation((req, { message, statusCode }) => 
      NextResponse.json({ error: message }, { status: statusCode })
    );
  });

  afterEach(() => {
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  describe('HTTP Method Handlers', () => {
    it('should handle GET requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users');
      const params = Promise.resolve(mockParams);
      
      const response = await GET(request, { params });
      
      expect(response).toBeDefined();
      expect(ProjectData.getProject).toHaveBeenCalledWith('project-1');
    });

    it('should handle POST requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users', {
        method: 'POST'
      });
      const params = Promise.resolve(mockParams);
      
      const response = await POST(request, { params });
      
      expect(response).toBeDefined();
      expect(EndpointData.getEndpoints).toHaveBeenCalledWith({
        where: { method: 'POST', projectId: 'project-1' }
      });
    });

    it('should handle PUT requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users', {
        method: 'PUT'
      });
      const params = Promise.resolve(mockParams);
      
      await PUT(request, { params });
      
      expect(EndpointData.getEndpoints).toHaveBeenCalledWith({
        where: { method: 'PUT', projectId: 'project-1' }
      });
    });

    it('should handle DELETE requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users', {
        method: 'DELETE'
      });
      const params = Promise.resolve(mockParams);
      
      await DELETE(request, { params });
      
      expect(EndpointData.getEndpoints).toHaveBeenCalledWith({
        where: { method: 'DELETE', projectId: 'project-1' }
      });
    });

    it('should handle PATCH requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users', {
        method: 'PATCH'
      });
      const params = Promise.resolve(mockParams);
      
      await PATCH(request, { params });
      
      expect(EndpointData.getEndpoints).toHaveBeenCalledWith({
        where: { method: 'PATCH', projectId: 'project-1' }
      });
    });
  });

  describe('Parameter Validation', () => {
    it('should return error when projectId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/mock//users');
      const params = Promise.resolve({ projectId: '', path: ['users'] });
      
      await GET(request, { params });
      
      expect(errorResponse).toHaveBeenCalledWith(request, {
        message: 'Project ID is required',
        statusCode: 400
      });
    });

    it('should return error when path is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/');
      const params = Promise.resolve({ projectId: 'project-1', path: [] });
      
      await GET(request, { params });
      
      expect(errorResponse).toHaveBeenCalledWith(request, {
        message: 'Invalid path',
        statusCode: 400
      });
    });
  });

  describe('Project Validation', () => {
    it('should return error when project is not found', async () => {
      vi.mocked(ProjectData.getProject).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users');
      const params = Promise.resolve(mockParams);
      
      await GET(request, { params });
      
      expect(errorResponse).toHaveBeenCalledWith(request, {
        message: 'Project not found',
        statusCode: 404
      });
    });
  });

  describe('Token Authentication', () => {
    beforeEach(() => {
      vi.mocked(ProjectData.getProject).mockResolvedValue({
        ...mockProject,
        isNeedToken: true,
        token: 'valid-token'
      });
    });

    it('should return error when authorization header is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users');
      const params = Promise.resolve(mockParams);
      
      await GET(request, { params });
      
      expect(errorResponse).toHaveBeenCalledWith(request, {
        message: 'Unauthorized',
        statusCode: 401
      });
    });

    it('should return error when authorization header format is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users', {
        headers: { authorization: 'invalid-format' }
      });
      const params = Promise.resolve(mockParams);
      
      await GET(request, { params });
      
      expect(errorResponse).toHaveBeenCalledWith(request, {
        message: 'Unauthorized',
        statusCode: 401
      });
    });

    it('should return error when token is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users', {
        headers: { authorization: 'Bearer invalid-token' }
      });
      const params = Promise.resolve(mockParams);
      
      await GET(request, { params });
      
      expect(errorResponse).toHaveBeenCalledWith(request, {
        message: 'Invalid or expired token',
        statusCode: 401
      });
    });

    it('should proceed when valid token is provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users', {
        headers: { authorization: 'Bearer valid-token' }
      });
      const params = Promise.resolve(mockParams);
      
      const response = await GET(request, { params });
      
      expect(response).toBeDefined();
      expect(EndpointData.getEndpoints).toHaveBeenCalled();
    });
  });

  describe('Endpoint Matching', () => {
    it('should return error when no matching endpoint is found', async () => {
      vi.mocked(EndpointData.getEndpoints).mockResolvedValue([]);
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/nonexistent');
      const params = Promise.resolve({ projectId: 'project-1', path: ['nonexistent'] });
      
      await GET(request, { params });
      
      expect(errorResponse).toHaveBeenCalledWith(request, {
        message: 'Endpoint not found',
        statusCode: 404
      });
    });

    it('should match exact path', async () => {
      const endpoint = {
        ...mockEndpoint,
        path: '/users/profile'
      };
      vi.mocked(EndpointData.getEndpoints).mockResolvedValue([endpoint]);
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users/profile');
      const params = Promise.resolve({ projectId: 'project-1', path: ['users', 'profile'] });
      
      const response = await GET(request, { params });
      
      expect(response).toBeDefined();
      expect(EndpointService.getEndpointResponse).toHaveBeenCalledWith(endpoint, {});
    });

    it('should match path with ID parameter using colon syntax', async () => {
      const endpoint = {
        ...mockEndpoint,
        path: '/users/:id'
      };
      vi.mocked(EndpointData.getEndpoints).mockResolvedValue([endpoint]);
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users/123');
      const params = Promise.resolve({ projectId: 'project-1', path: ['users', '123'] });
      
      const response = await GET(request, { params });
      
      expect(response).toBeDefined();
      expect(EndpointService.getEndpointResponse).toHaveBeenCalledWith(endpoint, {});
    });

    it('should match path with ID parameter using brace syntax', async () => {
      const endpoint = {
        ...mockEndpoint,
        path: '/users/{id}'
      };
      vi.mocked(EndpointData.getEndpoints).mockResolvedValue([endpoint]);
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users/abc-123');
      const params = Promise.resolve({ projectId: 'project-1', path: ['users', 'abc-123'] });
      
      const response = await GET(request, { params });
      
      expect(response).toBeDefined();
      expect(EndpointService.getEndpointResponse).toHaveBeenCalledWith(endpoint, {});
    });

    it('should not match path with invalid ID parameter', async () => {
      const endpoint = {
        ...mockEndpoint,
        path: '/users/:id'
      };
      vi.mocked(EndpointData.getEndpoints).mockResolvedValue([endpoint]);
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users/invalid-id-format');
      const params = Promise.resolve({ projectId: 'project-1', path: ['users', 'invalid-id-format'] });
      
      await GET(request, { params });
      
      expect(errorResponse).toHaveBeenCalledWith(request, {
        message: 'Endpoint not found',
        statusCode: 404
      });
    });

    it('should not match paths with different lengths', async () => {
      const endpoint = {
        ...mockEndpoint,
        path: '/users'
      };
      vi.mocked(EndpointData.getEndpoints).mockResolvedValue([endpoint]);
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users/extra/path');
      const params = Promise.resolve({ projectId: 'project-1', path: ['users', 'extra', 'path'] });
      
      await GET(request, { params });
      
      expect(errorResponse).toHaveBeenCalledWith(request, {
        message: 'Endpoint not found',
        statusCode: 404
      });
    });
  });

  describe('CORS Handling', () => {
    it('should allow all origins when no CORS restrictions are set', async () => {
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users', {
        headers: { origin: 'https://example.com' }
      });
      const params = Promise.resolve(mockParams);
      
      const response = await GET(request, { params });
      const responseData = await response.json();
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, PATCH, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    });

    it('should allow specific origin when it matches CORS settings', async () => {
      vi.mocked(ProjectData.getProject).mockResolvedValue({
        ...mockProject,
        corsOrigins: ['https://allowed.com', 'https://another.com']
      });
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users', {
        headers: { origin: 'https://allowed.com' }
      });
      const params = Promise.resolve(mockParams);
      
      const response = await GET(request, { params });
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://allowed.com');
      expect(mockConsoleLog).toHaveBeenCalledWith('CORS: Origin "https://allowed.com" ALLOWED - adding CORS headers');
    });

    it('should not add CORS headers when origin is not allowed', async () => {
      vi.mocked(ProjectData.getProject).mockResolvedValue({
        ...mockProject,
        corsOrigins: ['https://allowed.com']
      });
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users', {
        headers: { origin: 'https://notallowed.com' }
      });
      const params = Promise.resolve(mockParams);
      
      const response = await GET(request, { params });
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith('CORS: Origin "https://notallowed.com" NOT ALLOWED - returning response without CORS headers');
    });

    it('should handle requests without origin header', async () => {
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users');
      const params = Promise.resolve(mockParams);
      
      const response = await GET(request, { params });
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(mockConsoleLog).toHaveBeenCalledWith('CORS: No restrictions set - allowing all origins');
    });
  });

  describe('Query Parameters', () => {
    it('should parse and pass query parameters to endpoint service', async () => {
      const mockQueryParams = { page: 1, limit: 10, search: 'test' };
      vi.mocked(QueryParamsHelper.parseQueryParams).mockReturnValue(mockQueryParams);
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users?page=1&limit=10&search=test');
      const params = Promise.resolve(mockParams);
      
      await GET(request, { params });
      
      expect(QueryParamsHelper.parseQueryParams).toHaveBeenCalledWith(new URL(request.url));
      expect(EndpointService.getEndpointResponse).toHaveBeenCalledWith(mockEndpoint, mockQueryParams);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(ProjectData.getProject).mockRejectedValue(new Error('Database connection failed'));
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users');
      const params = Promise.resolve(mockParams);
      
      const response = await GET(request, { params });
      const responseData = await response.json();
      
      expect(responseData).toEqual({ error: 'Internal server error' });
      expect(response.status).toBe(500);
      expect(mockConsoleError).toHaveBeenCalledWith('Error handling mock request:', expect.any(Error));
    });

    it('should handle endpoint service errors gracefully', async () => {
      vi.mocked(EndpointService.getEndpointResponse).mockImplementation(() => {
        throw new Error('Service error');
      });
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users');
      const params = Promise.resolve(mockParams);
      
      const response = await GET(request, { params });
      const responseData = await response.json();
      
      expect(responseData).toEqual({ error: 'Internal server error' });
      expect(response.status).toBe(500);
    });
  });

  describe('Response Generation', () => {
    it('should return successful response with correct data', async () => {
      const expectedResponse = { message: 'success', data: [{ id: 1, name: 'John' }] };
      vi.mocked(EndpointService.getEndpointResponse).mockReturnValue(expectedResponse);
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users');
      const params = Promise.resolve(mockParams);
      
      const response = await GET(request, { params });
      const responseData = await response.json();
      
      expect(responseData).toEqual(expectedResponse);
      expect(response.status).toBe(200);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete flow with token auth and CORS', async () => {
      vi.mocked(ProjectData.getProject).mockResolvedValue({
        ...mockProject,
        isNeedToken: true,
        token: 'valid-token',
        corsOrigins: ['https://example.com']
      });
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users', {
        headers: {
          authorization: 'Bearer valid-token',
          origin: 'https://example.com'
        }
      });
      const params = Promise.resolve(mockParams);
      
      const response = await GET(request, { params });
      const responseData = await response.json();
      
      expect(responseData).toEqual({ message: 'success', data: [{ id: 1, name: 'John' }] });
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
      expect(EndpointService.getEndpointResponse).toHaveBeenCalledWith(mockEndpoint, {});
    });

    it('should handle complex path matching with multiple parameters', async () => {
      const complexEndpoint = {
        ...mockEndpoint,
        path: '/users/:userId/posts/{postId}/comments'
      };
      vi.mocked(EndpointData.getEndpoints).mockResolvedValue([complexEndpoint]);
      
      const request = new NextRequest('http://localhost:3000/api/mock/project-1/users/123/posts/abc-456/comments');
      const params = Promise.resolve({
        projectId: 'project-1',
        path: ['users', '123', 'posts', 'abc-456', 'comments']
      });
      
      const response = await GET(request, { params });
      
      expect(response).toBeDefined();
      expect(EndpointService.getEndpointResponse).toHaveBeenCalledWith(complexEndpoint, {});
    });
  });
});