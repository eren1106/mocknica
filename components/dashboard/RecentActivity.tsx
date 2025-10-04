"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/hooks/useProject";
import { Clock, FolderOpen, Users } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const RecentActivity = () => {
  const { data: projects, isLoading } = useProjects();

  // Sort projects by creation date (most recent first)
  const recentProjects = React.useMemo(() => {
    if (!projects) return [];
    return [...projects]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [projects]);

  const formatDate = (date: Date | string) => {
    const now = new Date();
    const projectDate = new Date(date);
    const diffInMs = now.getTime() - projectDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return projectDate.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!recentProjects.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first project to see activity here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentProjects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
          >
            <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{project.name}</h4>
                {/* <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  {project.permission === "PUBLIC" ? (
                    <Globe className="h-3 w-3" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                  {convertEnumToTitleCase(project.permission)}
                </Badge> */}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {project.user.name}
                </span>
                <span>{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">
                  {project.endpoints.length} endpoints
                </span>
                <span className="text-xs text-muted-foreground">
                  {project.schemas.length} schemas
                </span>
              </div>
            </div>
          </Link>
        ))}
        
        {projects && projects.length > 5 && (
          <Link
            href="/projects"
            className="block w-full text-center py-2 text-sm text-primary hover:underline"
          >
            View all projects ({projects.length})
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;