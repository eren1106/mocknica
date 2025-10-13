import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * Health check endpoint
 * Returns the health status of the application and its dependencies
 */
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'mocknica-api',
        checks: {
          database: 'connected',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Log the error for debugging
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'mocknica-api',
        checks: {
          database: 'disconnected',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 } // Service Unavailable
    );
  }
}
