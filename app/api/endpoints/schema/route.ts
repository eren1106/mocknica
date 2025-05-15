import { apiResponse, errorResponse } from "@/app/api/_helpers/api-response";
import { EndpointData } from "@/data/endpoint.data";
import { HttpMethod } from "@prisma/client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const {
            schemaId,
            basePath,
        } = await req.json();
        // create GET, GET/:id, POST, PUT, DELETE endpoints
        const get = await EndpointData.createEndpoint({
            name: `GET ${basePath}`,
            description: `GET ${basePath}`,
            method: HttpMethod.GET,
            path: basePath,
            schemaId,
            isDataList: true,
            staticResponse: null,
            responseWrapperId: null,
        });
        const getById = await EndpointData.createEndpoint({
            name: `GET ${basePath}/:id`,
            description: `GET ${basePath}/:id`,
            method: HttpMethod.GET,
            path: `${basePath}/:id`,
            schemaId,
            isDataList: false,
            staticResponse: null,
            responseWrapperId: null,
        });
        const post = await EndpointData.createEndpoint({
            name: `POST ${basePath}`,
            description: `POST ${basePath}`,
            method: HttpMethod.POST,
            path: basePath,
            schemaId,
            isDataList: false,
            staticResponse: null,
            responseWrapperId: null,
        });
        const putById = await EndpointData.createEndpoint({
            name: `PUT ${basePath}/:id`,
            description: `PUT ${basePath}/:id`,
            method: HttpMethod.PUT,
            path: `${basePath}/:id`,
            schemaId,
            isDataList: false,
            staticResponse: null,
            responseWrapperId: null,
        });
        const deleteById = await EndpointData.createEndpoint({
            name: `DELETE ${basePath}/:id`,
            description: `DELETE ${basePath}/:id`,
            method: HttpMethod.DELETE,
            path: `${basePath}/:id`,
            schemaId,
            isDataList: false,
            staticResponse: null,
            responseWrapperId: null,
        });
        return apiResponse(req, { data: [get, getById, post, putById, deleteById] });
      } catch (error) {
        return errorResponse(req, { error });
      }
}
  