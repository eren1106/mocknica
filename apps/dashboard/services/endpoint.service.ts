import { apiRequest } from "@/helpers/api-request";
import { Endpoint } from "@/models/endpoint.model";
import { ResponseWrapperService } from "./response-wrapper.service";
import { SchemaService } from "./schema.service";
import { QueryParams, QueryParamsHelper } from "@/helpers/query-params";

export class EndpointService {
  static async getAllEndpoints(projectId?: string): Promise<Endpoint[]> {
    const url = projectId ? `endpoints?projectId=${projectId}` : "endpoints";
    const res = await apiRequest.get(url);
    return res.data;
  }

  static async createEndpoint(data: Partial<Endpoint>): Promise<Endpoint> {
    const res = await apiRequest.post("endpoints", data);
    return res.data;
  }

  static async createEndpointsBySchema(data: {
    schemaId: number;
    basePath: string;
    responseWrapperId?: number;
  }): Promise<Endpoint[]> {
    const res = await apiRequest.post("endpoints/schema", data);
    return res.data;
  }

  static async updateEndpoint(
    id: string,
    data: Partial<Endpoint>
  ): Promise<Endpoint> {
    const res = await apiRequest.put(`endpoints/${id}`, data);
    return res.data;
  }

  static async deleteEndpoint(id: string): Promise<void> {
    await apiRequest.delete(`endpoints/${id}`);
  }

  // display what the endpoint should return when user request the mock data
  static getEndpointResponse(endpoint: Endpoint, queryParams?: QueryParams) {
    let response: any;

    // Handle schema-based responses
    if (endpoint.schema) {
      response = SchemaService.generateResponseFromSchema(
        endpoint.schema,
        endpoint.isDataList,
        endpoint.numberOfData || undefined
      );
    } else {
      // Handle static responses
      response = endpoint.staticResponse;
    }

    // Apply response wrapper if present
    if (endpoint.responseWrapper) {
      response = ResponseWrapperService.generateResponseWrapperJson({
        response: response,
        wrapper: endpoint.responseWrapper,
      });
    }

    // Apply query parameter processing if it's an array
    if (Array.isArray(response) && queryParams) {
      const result = QueryParamsHelper.processData(response, queryParams);
      response = result.data;
    }

    return response;
  }
}
