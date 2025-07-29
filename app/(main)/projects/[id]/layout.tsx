import { notFound } from "next/navigation";
import { ProjectData } from "@/data/project.data";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { id } = await params;
  const project = await ProjectData.getProject(id);

  if (!project) {
    notFound();
  }

  return children;
}
