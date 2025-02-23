'use client'

import EndpointForm from "@/components/endpoint-management-form";
import EndpointsList from "@/components/endpoints-list";
import { Endpoint } from "@prisma/client";
import { useState } from "react";

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Mock API Server</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EndpointForm/>
        <EndpointsList />
      </div>
    </main>
  );
}