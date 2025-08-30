import { describe, it, expect, beforeEach } from 'vitest';
import { ResponseWrapperService } from '../response-wrapper.service';
import { ResponseWrapper } from '@prisma/client';
import { WRAPPER_DATA_STR } from '@/constants';

describe('ResponseWrapperService.generateResponseWrapperJson', () => {
  beforeEach(() => {
    // No mocks needed for this service as it doesn't depend on external services
  });

  it('should wrap response data correctly with simple wrapper', () => {
    // Arrange
    const responseData = { id: 1, name: 'John Doe' };
    const wrapper: ResponseWrapper = {
      id: 1,
      name: 'Success Wrapper',
      projectId: 'project1',
      json: {
        success: true,
        data: WRAPPER_DATA_STR,
        message: 'Request successful'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Act
    const result = ResponseWrapperService.generateResponseWrapperJson({
      response: responseData,
      wrapper
    });

    // Assert
    expect(result).toEqual({
      success: true,
      data: responseData,
      message: 'Request successful'
    });
  });

  it('should wrap array response data correctly', () => {
    // Arrange
    const responseData = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ];
    const wrapper: ResponseWrapper = {
      id: 1,
      name: 'List Wrapper',
      projectId: 'project1',
      json: {
        success: true,
        data: WRAPPER_DATA_STR,
        count: 2
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Act
    const result = ResponseWrapperService.generateResponseWrapperJson({
      response: responseData,
      wrapper
    });

    // Assert
    expect(result).toEqual({
      success: true,
      data: responseData,
      count: 2
    });
  });

  it('should handle complex nested wrapper structure', () => {
    // Arrange
    const responseData = { user: { id: 1, email: 'test@example.com' } };
    const wrapper: ResponseWrapper = {
      id: 1,
      name: 'Complex Wrapper',
      projectId: 'project1',
      json: {
        status: 'ok',
        result: {
          payload: WRAPPER_DATA_STR,
          metadata: {
            timestamp: '2023-01-01T00:00:00Z',
            version: '1.0'
          }
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Act
    const result = ResponseWrapperService.generateResponseWrapperJson({
      response: responseData,
      wrapper
    });

    // Assert
    expect(result).toEqual({
      status: 'ok',
      result: {
        payload: responseData,
        metadata: {
          timestamp: '2023-01-01T00:00:00Z',
          version: '1.0'
        }
      }
    });
  });

  it('should handle multiple WRAPPER_DATA_STR occurrences', () => {
    // Arrange
    const responseData = { message: 'Hello World' };
    const wrapper: ResponseWrapper = {
      id: 1,
      name: 'Multi Data Wrapper',
      projectId: 'project1',
      json: {
        primary: WRAPPER_DATA_STR,
        backup: WRAPPER_DATA_STR,
        meta: {
          original: WRAPPER_DATA_STR
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Act
    const result = ResponseWrapperService.generateResponseWrapperJson({
      response: responseData,
      wrapper
    });

    // Assert
    expect(result).toEqual({
      primary: responseData,
      backup: responseData,
      meta: {
        original: responseData
      }
    });
  });

  it('should handle null/undefined response data', () => {
    // Arrange
    const responseData = null;
    const wrapper: ResponseWrapper = {
      id: 1,
      name: 'Null Wrapper',
      projectId: 'project1',
      json: {
        data: WRAPPER_DATA_STR,
        isEmpty: true
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Act
    const result = ResponseWrapperService.generateResponseWrapperJson({
      response: responseData,
      wrapper
    });

    // Assert
    expect(result).toEqual({
      data: null,
      isEmpty: true
    });
  });

  it('should handle string response data', () => {
    // Arrange
    const responseData = 'Simple string response';
    const wrapper: ResponseWrapper = {
      id: 1,
      name: 'String Wrapper',
      projectId: 'project1',
      json: {
        message: WRAPPER_DATA_STR,
        type: 'string'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Act
    const result = ResponseWrapperService.generateResponseWrapperJson({
      response: responseData,
      wrapper
    });

    // Assert
    expect(result).toEqual({
      message: responseData,
      type: 'string'
    });
  });

  it('should handle number response data', () => {
    // Arrange
    const responseData = 42;
    const wrapper: ResponseWrapper = {
      id: 1,
      name: 'Number Wrapper',
      projectId: 'project1',
      json: {
        value: WRAPPER_DATA_STR,
        type: 'number'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Act
    const result = ResponseWrapperService.generateResponseWrapperJson({
      response: responseData,
      wrapper
    });

    // Assert
    expect(result).toEqual({
      value: responseData,
      type: 'number'
    });
  });

  it('should handle boolean response data', () => {
    // Arrange
    const responseData = true;
    const wrapper: ResponseWrapper = {
      id: 1,
      name: 'Boolean Wrapper',
      projectId: 'project1',
      json: {
        result: WRAPPER_DATA_STR,
        success: true
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Act
    const result = ResponseWrapperService.generateResponseWrapperJson({
      response: responseData,
      wrapper
    });

    // Assert
    expect(result).toEqual({
      result: responseData,
      success: true
    });
  });

  it('should preserve wrapper structure when no WRAPPER_DATA_STR is present', () => {
    // Arrange
    const responseData = { id: 1, name: 'John Doe' };
    const wrapper: ResponseWrapper = {
      id: 1,
      name: 'No Data Wrapper',
      projectId: 'project1',
      json: {
        status: 'success',
        message: 'Operation completed',
        timestamp: '2023-01-01T00:00:00Z'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Act
    const result = ResponseWrapperService.generateResponseWrapperJson({
      response: responseData,
      wrapper
    });

    // Assert
    expect(result).toEqual({
      status: 'success',
      message: 'Operation completed',
      timestamp: '2023-01-01T00:00:00Z'
    });
  });

  it('should handle deeply nested WRAPPER_DATA_STR', () => {
    // Arrange
    const responseData = { users: [{ id: 1 }, { id: 2 }] };
    const wrapper: ResponseWrapper = {
      id: 1,
      name: 'Deep Nested Wrapper',
      projectId: 'project1',
      json: {
        api: {
          version: '1.0',
          response: {
            data: {
              payload: WRAPPER_DATA_STR
            },
            meta: {
              count: 2
            }
          }
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Act
    const result = ResponseWrapperService.generateResponseWrapperJson({
      response: responseData,
      wrapper
    });

    // Assert
    expect(result).toEqual({
      api: {
        version: '1.0',
        response: {
          data: {
            payload: responseData
          },
          meta: {
            count: 2
          }
        }
      }
    });
  });
});
