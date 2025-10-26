"use client";

import React from "react";
import { Search, Filter, SortAsc, SortDesc, List, Grid3X3 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";

export interface SortOption {
  value: string;
  label: string;
}

export interface FilterOption {
  value: string;
  label: string;
  badge?: {
    text: string;
    className: string;
  };
}

export interface ControlsBarProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Sort
  sortValue: string;
  onSortChange: (value: string) => void;
  sortOptions: SortOption[];

  // Filter (optional)
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];

  // View mode (optional)
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
  showViewToggle?: boolean;

  // Additional custom controls
  additionalControls?: React.ReactNode;
}

const ControlsBar: React.FC<ControlsBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  sortValue,
  onSortChange,
  sortOptions,
  filterValue,
  onFilterChange,
  filterOptions,
  viewMode,
  onViewModeChange,
  showViewToggle = false,
  additionalControls,
}) => {
  const getSortLabel = (value: string) => {
    return sortOptions.find(option => option.value === value)?.label || "Sort";
  };

  const getFilterLabel = (value?: string) => {
    if (!value || !filterOptions) return "Filter";
    return filterOptions.find(option => option.value === value)?.label || "Filter";
  };

  const sortDirection = sortValue.includes("asc") ? "asc" : "desc";

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-2 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            {/* Filter Dropdown (if provided) */}
            {filterOptions && onFilterChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4" />
                    {getFilterLabel(filterValue)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {filterOptions.map((option) => (
                    <DropdownMenuItem 
                      key={option.value} 
                      onClick={() => onFilterChange(option.value)}
                    >
                      {option.badge && (
                        <Badge className={option.badge.className + " mr-2"}>
                          {option.badge.text}
                        </Badge>
                      )}
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                  {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  {getSortLabel(sortValue)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option.value} 
                    onClick={() => onSortChange(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle (if enabled) */}
            {showViewToggle && viewMode && onViewModeChange && (
              <div className="flex border border-border rounded-md">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-r-none border-0"
                  onClick={() => onViewModeChange("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-l-none border-0"
                  onClick={() => onViewModeChange("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Additional custom controls */}
            {additionalControls}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlsBar;