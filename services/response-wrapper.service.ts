import { apiRequest } from "@/helpers/api-request";
import { ResponseWrapper } from "@prisma/client";

export class ResponseWrapperService {
  static async getAllResponseWrappers(): Promise<ResponseWrapper[]> {
    const res = await apiRequest.get("response-wrappers");
    return res.data;
  }

  static async getResponseWrapperById(id: number): Promise<ResponseWrapper> {
    const res = await apiRequest.get(`response-wrappers/${id}`);
    return res.data;
  }

  static async createResponseWrapper(data: Partial<ResponseWrapper>): Promise<ResponseWrapper> {
    const res = await apiRequest.post("response-wrappers", data);
    return res.data;
  }

  static async updateResponseWrapper(
    id: number,
    data: Partial<ResponseWrapper>
  ): Promise<ResponseWrapper> {
    const res = await apiRequest.put(`response-wrappers/${id}`, data);
    return res.data;
  }

  static async deleteResponseWrapper(id: number): Promise<void> {
    await apiRequest.delete(`response-wrappers/${id}`);
  }
}
