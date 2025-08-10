import { apiRequest } from "@/helpers/api-request";
import { Endpoint } from "@/models/endpoint.model";
import { ResponseWrapperService } from "./response-wrapper.service";
import { SchemaService } from "./schema.service";
import { Schema } from "@/models/schema.model";

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
  static getEndpointResponse(endpoint: Endpoint) {
    let response;
    // WITH SCHEMA
    if (endpoint.schemaId && endpoint.schema) {
      response = SchemaService.generateResponseFromSchema(
        endpoint.schema as Schema,
        endpoint.isDataList,
        endpoint.numberOfData ?? undefined
      );
      if (endpoint.responseWrapper) {
        response = ResponseWrapperService.generateResponseWrapperJson({
          response,
          wrapper: endpoint.responseWrapper,
        });
      }
    }
    // WITH STATIC RESPONSE
    else {
      response = endpoint.responseWrapper
        ? ResponseWrapperService.generateResponseWrapperJson({
            response: endpoint.staticResponse,
            wrapper: endpoint.responseWrapper,
          })
        : endpoint.staticResponse;
    }
    return response;
  }
}
