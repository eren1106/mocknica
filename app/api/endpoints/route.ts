// app/api/endpoints/route.ts
import { NextRequest } from 'next/server';
import { EndpointData } from '@/data/endpoint.data';
import { apiResponse, errorResponse } from '../_helpers/api-response';
import { requireAuth, requireProjectOwnership } from '../_helpers/auth-guards';
import { ProjectData } from '@/data/project.data';

export async function POST(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    
    // directly return response if sessionResult is a response (in this case, it is error response)
    if (sessionResult instanceof Response) return sessionResult;

    const data = await req.json();
    
    // Verify project ownership before creating endpoint
    if (data.projectId) {
      const ownershipResult = await requireProjectOwnership(req, data.projectId, sessionResult.user.id);
      if (ownershipResult instanceof Response) {
        return ownershipResult;
      }
    }

    const endpoint = await EndpointData.createEndpoint(data);
    return apiResponse(req, { data: endpoint });
  } catch (error) {
    console.error('Error creating endpoint:', error);
    return errorResponse(req, { error });
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    
    if (sessionResult instanceof Response) {
      return sessionResult;
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    
    if (projectId) {
      // Verify project ownership
      const ownershipResult = await requireProjectOwnership(req, projectId, sessionResult.user.id);
      if (ownershipResult instanceof Response) {
        return ownershipResult;
      }
      
      const endpoints = await EndpointData.getEndpoints({ where: { projectId } });
      return apiResponse(req, { data: endpoints });
    } else {
      // Get all endpoints for user's projects
      const userProjects = await ProjectData.getAllProjects(sessionResult.user.id);
      const projectIds = userProjects.map(p => p.id);
      const endpoints = await EndpointData.getEndpoints({ 
        where: { projectId: { in: projectIds } } 
      });
      return apiResponse(req, { data: endpoints });
    }
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return errorResponse(req, { error });
  }
}