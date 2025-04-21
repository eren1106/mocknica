// app/api/endpoints/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { EndpointData } from '@/data/endpoint.data';
import { apiResponse, errorResponse } from '../_helpers/api-response';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Convert string JSON fields to actual JSON
    const endpoint = await prisma.endpoint.create({
      data: {
        ...data,
        staticResponse: data.staticResponse ? JSON.parse(data.staticResponse) : null,
      },
    });

    return apiResponse(req, { data: endpoint });
  } catch (error) {
    console.error('Error creating endpoint:', error);
    return errorResponse(req, { error: 'Failed to create endpoint' });
  }
}

export async function GET(req: NextRequest) {
  try {
    const endpoints = await EndpointData.getEndpoints();
    return apiResponse(req, { data: endpoints });
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return errorResponse(req, { error: 'Failed to fetch endpoints' });
  }
}