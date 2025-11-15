import { apiRequest } from "@/helpers/api-request";
import { ResponseWrapperService } from "./response-wrapper.service";
import { QueryParams, QueryParamsHelper } from "@/helpers/query-params";
import { IEndpoint, ISchema } from "@/types";

export class EndpointService {
  static async getAllEndpoints(projectId?: string): Promise<IEndpoint[]> {
    const url = projectId ? `endpoints?projectId=${projectId}` : "endpoints";
    const res = await apiRequest.get(url);
    return res.data;
  }

  static async createEndpoint(data: Partial<IEndpoint>): Promise<IEndpoint> {
    const res = await apiRequest.post("endpoints", data);
    return res.data;
  }

  static async createBulkEndpoints(data: {
    projectId: string;
    schemas?: Omit<ISchema, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>[];
    endpoints?: Partial<IEndpoint>[];
  }): Promise<{ schemas: any[]; endpoints: IEndpoint[] }> {
    const res = await apiRequest.post("endpoints/bulk", data);
    return res.data;
  }

  static async createEndpointsBySchema(data: {
    schemaId: number;
    basePath: string;
    responseWrapperId?: number;
  }): Promise<IEndpoint[]> {
    const res = await apiRequest.post("endpoints/schema", data);
    return res.data;
  }

  static async updateEndpoint(
    id: string,
    data: Partial<IEndpoint>
  ): Promise<IEndpoint> {
    const res = await apiRequest.put(`endpoints/${id}`, data);
    return res.data;
  }

  static async deleteEndpoint(id: string): Promise<void> {
    await apiRequest.delete(`endpoints/${id}`);
  }

  // display what the endpoint should return when user request the mock data
  static getEndpointResponse(endpoint: IEndpoint, queryParams?: QueryParams) {
    let response: any;

    // Handle schema-based responses
    // if (endpoint.schema) {
    //   response = SchemaService.generateResponseFromSchema(
    //     endpoint.schema,
    //     endpoint.isDataList ?? false, // Convert null to false
    //     endpoint.numberOfData || undefined
    //   );
    // } else {
    //   // Handle static responses
    //   response = endpoint.staticResponse;
    // }
    response = endpoint.staticResponse;

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
