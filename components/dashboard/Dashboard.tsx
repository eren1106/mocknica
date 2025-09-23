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
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your API projects and quick
          actions to get you started.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Wider */}
        <div className="lg:col-span-2 space-y-8">
          <RecentActivity />
        </div>

        {/* Right Column - Narrower */}
        <div className="space-y-8">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
