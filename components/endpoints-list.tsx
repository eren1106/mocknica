'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Endpoint {
  id: string;
  name: string;
  method: string;
  path: string;
  description?: string;
}

export default function EndpointsList() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);

  useEffect(() => {
    const fetchEndpoints = async () => {
      try {
        const response = await fetch('/api/endpoints');
        const data = await response.json();
        setEndpoints(data);
      } catch (error) {
        console.error('Error fetching endpoints:', error);
      }
    };

    fetchEndpoints();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Available Endpoints</h2>
      {endpoints.map((endpoint) => (
        <Card key={endpoint.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {endpoint.method}
              </span>
              <span>{endpoint.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-2">{endpoint.description}</p>
            <p className="font-mono bg-gray-100 p-2 rounded">
              {endpoint.path}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}