import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectService } from '@/services/project.service';
import { Project } from '@/models/project.model';
import { ProjectSchemaType } from '@/zod-schemas/project.schema';
import { toast } from 'sonner';

const PROJECTS_QUERY_KEY = 'projects';

// TODO: need userId prop
export const useProjects = () => {
  return useQuery<Project[]>({
    queryKey: [PROJECTS_QUERY_KEY],
    queryFn: ProjectService.getAllProjects,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useProject = (id: string) => {
  return useQuery<Project>({
    queryKey: [PROJECTS_QUERY_KEY, id],
    queryFn: () => ProjectService.getProject(id),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!id,
  });
};

export const useMutationProject = () => {
  const queryClient = useQueryClient();
  const invalidateQueries = () => queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });

  const createProject = useMutation({ 
    mutationFn: (data: ProjectSchemaType) => ProjectService.createProject(data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Project created successfully");
    },
  });

  const updateProject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectSchemaType> }) =>
      ProjectService.updateProject(id, data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Project updated successfully");
    },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => ProjectService.deleteProject(id),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Project deleted successfully");
    },
  });

  return {
    createProject: createProject.mutateAsync,
    updateProject: updateProject.mutateAsync,
    deleteProject: deleteProject.mutateAsync,
    isPending: createProject.isPending || updateProject.isPending || deleteProject.isPending,
  }
}
