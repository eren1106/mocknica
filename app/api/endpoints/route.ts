// app/api/endpoints/route.ts
import { NextRequest } from 'next/server';
import { EndpointData } from '@/data/endpoint.data';
import { apiResponse, errorResponse } from '../_helpers/api-response';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const endpoint = await EndpointData.createEndpoint(data);
    return apiResponse(req, { data: endpoint });
  } catch (error) {
    console.error('Error creating endpoint:', error);
    return errorResponse(req, { error: 'Failed to create endpoint' });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    
    const where = projectId ? { projectId } : undefined;
    const endpoints = await EndpointData.getEndpoints({ where });
    return apiResponse(req, { data: endpoints });
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return errorResponse(req, { error: 'Failed to fetch endpoints' });
  }
}