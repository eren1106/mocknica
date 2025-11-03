import { WRAPPER_DATA_STR } from "@/constants";
import { apiRequest } from "@/helpers/api-request";
import { IResponseWrapper } from "@/types";
import { JsonValue } from "@prisma/client/runtime/library";

export class ResponseWrapperService {
  static async getAllResponseWrappers(projectId?: string): Promise<IResponseWrapper[]> {
    const url = projectId ? `response-wrappers?projectId=${projectId}` : "response-wrappers";
    const res = await apiRequest.get(url);
    return res.data;
  }

  static async getResponseWrapperById(id: number): Promise<IResponseWrapper> {
    const res = await apiRequest.get(`response-wrappers/${id}`);
    return res.data;
  }

  static async createResponseWrapper(data: Partial<IResponseWrapper>): Promise<IResponseWrapper> {
    const res = await apiRequest.post("response-wrappers", data);
    return res.data;
  }

  static async updateResponseWrapper(
    id: number,
    data: Partial<IResponseWrapper>
  ): Promise<IResponseWrapper> {
    const res = await apiRequest.put(`response-wrappers/${id}`, data);
    return res.data;
  }

  static async deleteResponseWrapper(id: number): Promise<void> {
    await apiRequest.delete(`response-wrappers/${id}`);
  }

  static generateResponseWrapperJson({response, wrapper}: {response: JsonValue, wrapper: IResponseWrapper}): string {
    // replace "$data" with stringified response
    const res = wrapper.json.replaceAll(`"${WRAPPER_DATA_STR}"`, JSON.stringify(response));
    return JSON.parse(res);
  }
}
