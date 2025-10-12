import { redirect } from "next/navigation";
import { ProjectData } from "@/data/project.data";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { id } = await params;

  // Check authentication at server level
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) redirect("/login");

  // Get project only if user owns it
  const project = await ProjectData.getProjectByUserAndId(id, session.user.id);

  if (!project) redirect("/");

  return children;
}
