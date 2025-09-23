"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DialogButton from "@/components/dialog-button";
import { Plus, FolderOpen, Globe, FileJson2, ExternalLink } from "lucide-react";
import ProjectForm from "@/components/project/ProjectForm";
import Link from "next/link";

const QuickActions = () => {
  const actions = [
    {
      title: "Create Project",
      description: "Start a new API project",
      icon: FolderOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      component: (close: () => void) => <ProjectForm onSuccess={close} />,
    },
    {
      title: "View All Projects",
      description: "Browse existing projects",
      icon: Globe,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      href: "/projects",
    },
    {
      title: "API Documentation",
      description: "Learn about API usage",
      icon: FileJson2,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      href: "/docs",
      external: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          if (action.component) {
            return (
              <DialogButton
                key={index}
                variant="ghost"
                className="w-full justify-start h-auto p-4 border border-border hover:bg-muted/50"
                content={action.component}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`${action.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </div>
              </DialogButton>
            );
          }

          if (action.external) {
            return (
              <a
                key={index}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={`${action.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {action.description}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            );
          }

          return (
            <Link
              key={index}
              href={action.href!}
              className="flex items-center gap-3 w-full p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`${action.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${action.color}`} />
              </div>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default QuickActions;