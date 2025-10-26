"use client";

import { useState } from "react";
import { Card } from "@mocknica/ui";

export function CodePreview() {
  const [activeTab, setActiveTab] = useState<"request" | "response">("request");

  const requestCode = `fetch('http://localhost:3000/api/mock/my-project/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token'
  }
})`;

  const responseCode = `{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "developer",
      "createdAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": "2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "designer",
      "createdAt": "2025-01-14T09:20:00Z"
    }
  ],
  "total": 2
}`;

  return (
    <div className="relative">
      <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("request")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "request"
                ? "text-white bg-zinc-900 border-b-2 border-primary"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Request
          </button>
          <button
            onClick={() => setActiveTab("response")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "response"
                ? "text-white bg-zinc-900 border-b-2 border-primary"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Response
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 font-mono text-sm">
          <pre className="text-zinc-300 overflow-x-auto">
            <code>
              {activeTab === "request" ? requestCode : responseCode}
            </code>
          </pre>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-zinc-900/80 px-2 py-1 rounded-md">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-zinc-400">Live</span>
        </div>
      </Card>
    </div>
  );
}
