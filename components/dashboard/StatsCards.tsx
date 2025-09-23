"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/hooks/useProject";
import { FolderOpen, Globe, Database, FileJson2 } from "lucide-react";

const StatsCards = () => {
  const { data: projects, isLoading } = useProjects();

  const stats = React.useMemo(() => {
    if (!projects) return null;

    const totalProjects = projects.length;
    const totalEndpoints = projects.reduce((acc, project) => acc + project.endpoints.length, 0);
    const totalSchemas = projects.reduce((acc, project) => acc + project.schemas.length, 0);
    const totalWrappers = projects.reduce((acc, project) => acc + project.responseWrappers.length, 0);
    const publicProjects = projects.filter(project => project.permission === "PUBLIC").length;
    const privateProjects = projects.filter(project => project.permission === "PRIVATE").length;

    return {
      totalProjects,
      totalEndpoints,
      totalSchemas,
      totalWrappers,
      publicProjects,
      privateProjects,
    };
  }, [projects]);

  const statsData = [
    {
      title: "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: FolderOpen,
      description: `${stats?.publicProjects ?? 0} public, ${stats?.privateProjects ?? 0} private`,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "API Endpoints",
      value: stats?.totalEndpoints ?? 0,
      icon: Globe,
      description: "Active endpoints across all projects",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Schemas",
      value: stats?.totalSchemas ?? 0,
      icon: Database,
      description: "Data structure definitions",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "Response Wrappers",
      value: stats?.totalWrappers ?? 0,
      icon: FileJson2,
      description: "Custom response formats",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;