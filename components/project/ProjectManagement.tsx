"use client";

import { useMemo, useState } from "react";
import DialogButton from "@/components/dialog-button";
import ControlsBar from "@/components/controls-bar";
import { Plus, Grid3X3 } from "lucide-react";
import ProjectList from "./ProjectList";
import ProjectForm from "./ProjectForm";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProject";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SortOrder = "name-asc" | "name-desc" | "created-asc" | "created-desc";
type FilterType = "all" | "public" | "private";

const ProjectManagement = () => {
  const { isAuthenticated } = useAuth();
  const { data: projects, isLoading } = useProjects();
  const [sortOrder, setSortOrder] = useState<SortOrder>("created-desc");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sort options for ControlsBar
  const sortOptions = [
    { value: "created-desc", label: "Newest First" },
    { value: "created-asc", label: "Oldest First" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
  ];

  // Filter options for ControlsBar
  const filterOptions = [
    { value: "all", label: "All Projects" },
    { 
      value: "public", 
      label: "Public Only",
      badge: {
        text: "PUBLIC",
        className: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300"
      }
    },
    { 
      value: "private", 
      label: "Private Only",
      badge: {
        text: "PRIVATE",
        className: "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-300"
      }
    },
  ];

  const stats = useMemo(() => {
    if (!projects) return { total: 0, public: 0, private: 0 };
    
    return {
      total: projects.length,
      public: projects.filter(p => p.permission === "PUBLIC").length,
      private: projects.filter(p => p.permission === "PRIVATE").length,
    };
  }, [projects]);

  // This component should only be rendered within an AuthGuard,
  // but adding this as an extra safety measure
  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Organize your APIs into projects. Each project can contain endpoints, schemas, and response wrappers.
          </p>
        </div>
        
        <DialogButton
          content={(close) => <ProjectForm onSuccess={close} />}
          className="w-fit self-start lg:self-center"
        >
          <Plus className="size-4 mr-2" />
          Create Project
        </DialogButton>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{isLoading ? "..." : stats.total}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg">
                <Grid3X3 className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Public Projects</p>
                <p className="text-2xl font-bold text-green-600">{isLoading ? "..." : stats.public}</p>
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300">
                PUBLIC
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Private Projects</p>
                <p className="text-2xl font-bold text-orange-600">{isLoading ? "..." : stats.private}</p>
              </div>
              <Badge variant="secondary" className="bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-300">
                PRIVATE
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Bar */}
      <ControlsBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search projects..."
        sortValue={sortOrder}
        onSortChange={(value) => setSortOrder(value as SortOrder)}
        sortOptions={sortOptions}
        filterValue={filterType}
        onFilterChange={(value) => setFilterType(value as FilterType)}
        filterOptions={filterOptions}
      />

      {/* Project List */}
      <ProjectList 
        searchQuery={searchQuery}
        sortOrder={sortOrder}
        filterType={filterType}
      />
    </div>
  );
};

export default ProjectManagement;
