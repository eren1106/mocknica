import { apiRequest } from "@/helpers/api-request";
import { Endpoint } from "@/models/endpoint.model";
import { ResponseGeneration } from "@prisma/client";
import { ResponseWrapperService } from "./response-wrapper.service";
import { SchemaService } from "./schema.service";

export class EndpointService {
  static async getAllEndpoints(): Promise<Endpoint[]> {
    const res = await apiRequest.get("endpoints");
    return res.data;
  }

  static async createEndpoint(data: {
    name: string;
    description?: string;
    method: string;
    path: string;
    responseGen: string;
    staticResponse?: string | null;
    schemaId?: number | null;
  }): Promise<Endpoint> {
    const res = await apiRequest.post("endpoints", data);
    return res.data;
  }

  static async createEndpointsBySchema(data: {
    schemaId: number;
    basePath: string;
  }): Promise<Endpoint[]> {
    const res = await apiRequest.post("endpoints/schema", data);
    return res.data;
  }

  static async generateResponseByAI(prompt: string): Promise<any> {
    const res = await apiRequest.post("generate-response-ai", { prompt });
    return res.data;
  }

  static async updateEndpoint(
    id: string,
    data: Partial<Endpoint>
  ): Promise<Endpoint> {
    const res = await apiRequest.put(`endpoints/${id}`, data);
    return res.data;
  }

  static getEndpointResponse(endpoint: Endpoint) {
    let response;
    if (endpoint.responseGen === ResponseGeneration.STATIC) {
      response = endpoint.responseWrapper
        ? ResponseWrapperService.generateResponseWrapperJson({
            response: endpoint.staticResponse,
            wrapper: endpoint.responseWrapper,
          })
        : endpoint.staticResponse;
    } else if (
      endpoint.responseGen === ResponseGeneration.SCHEMA &&
      endpoint.schema
    ) {
      response = endpoint.responseWrapper
        ? ResponseWrapperService.generateResponseWrapperJson({
            response: SchemaService.generateResponseFromSchema(
              endpoint.schema
              // shouldReturnArray
            ),
            wrapper: endpoint.responseWrapper,
          })
        : SchemaService.generateResponseFromSchema(
            endpoint.schema
            // shouldReturnArray
          );
    }
    // else {
    //   response = shouldReturnArray ? [] : "no data";
    // }
    return response;
  }
}
