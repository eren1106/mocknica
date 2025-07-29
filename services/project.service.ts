import { apiRequest } from "@/helpers/api-request";
import { Project } from "@/models/project.model";
import { ProjectSchemaType } from "@/zod-schemas/project.schema";

export class ProjectService {
  static async getAllProjects(): Promise<Project[]> {
    const res = await apiRequest.get("projects");
    return res.data;
  }

  static async getProject(id: string): Promise<Project> {
    const res = await apiRequest.get(`projects/${id}`);
    return res.data;
  }

  static async createProject(data: ProjectSchemaType): Promise<Project> {
    const res = await apiRequest.post("projects", data);
    return res.data;
  }

  static async updateProject(
    id: string,
    data: Partial<ProjectSchemaType>
  ): Promise<Project> {
    const res = await apiRequest.put(`projects/${id}`, data);
    return res.data;
  }

  static async deleteProject(id: string): Promise<void> {
    await apiRequest.delete(`projects/${id}`);
  }
}
