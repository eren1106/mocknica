"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import StatsCards from "./StatsCards";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";

const Dashboard = () => {
  const { isAuthenticated } = useAuth();

  // This component should only be rendered within an AuthGuard,
  // but adding this as an extra safety measure
  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Welcome back! Here&apos;s an overview of your API projects and quick
          actions to get you started.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid gap-6 sm:gap-8 xl:grid-cols-3">
        {/* Left Column - Wider */}
        <div className="xl:col-span-2 space-y-6 sm:space-y-8">
          <RecentActivity />
        </div>

        {/* Right Column - Narrower */}
        <div className="space-y-6 sm:space-y-8">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
