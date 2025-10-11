import { Prisma } from '@prisma/client';
import { STATUS_CODES } from '@/constants/status-codes';

export enum ERROR_CODES {
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export class AppError extends Error {
  statusCode: number;
  errorCode: ERROR_CODES;
  data?: any;

  constructor(message: string, statusCode: number, errorCode: ERROR_CODES, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.data = data;
  }
}

export const handlePrismaError = (error: unknown): AppError => {
  // Log the original error for debugging (consider using a proper logging service)
  console.error('Original error:', error);

  // Handle custom AppError instances
  if (error instanceof AppError) return error;

  // Handle string errors that might indicate auth issues
  if (typeof error === 'string') {
    if (error.toLowerCase().includes('unauthorized')) {
      return new AppError(
        'Unauthorized access.',
        STATUS_CODES.UNAUTHORIZED,
        ERROR_CODES.AUTH_ERROR
      );
    }
    if (error.toLowerCase().includes('forbidden')) {
      return new AppError(
        'Access forbidden.',
        STATUS_CODES.FORBIDDEN,
        ERROR_CODES.AUTH_ERROR
      );
    }
    if (error.toLowerCase().includes('not found')) {
      return new AppError(
        'Resource not found.',
        STATUS_CODES.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      // Connection errors
      case 'P1000':
      case 'P1001':
      case 'P1002':
        return new AppError(
          'Service temporarily unavailable. Please try again later.',
          STATUS_CODES.SERVICE_UNAVAILABLE,
          ERROR_CODES.DATABASE_ERROR
        );
      
      // Unique constraint violations
      case 'P2002':
        return new AppError(
          'This record already exists.',
          STATUS_CODES.CONFLICT,
          ERROR_CODES.VALIDATION_ERROR
        );

      // Record not found
      case 'P2001':
      case 'P2025':
        return new AppError(
          'Requested resource not found.',
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );

      default:
        return new AppError(
          'An unexpected database error occurred.',
          STATUS_CODES.INTERNAL_SERVER_ERROR,
          ERROR_CODES.DATABASE_ERROR
        );
    }
  }

  if (error instanceof Error) {
    return new AppError(
      // error.message,
      'An internal error occurred. Please try again later.',
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_ERROR
    );
  }

  return new AppError(
    'An unexpected error occurred.',
    STATUS_CODES.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_ERROR
  );
};