'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Endpoint } from '@prisma/client';
import DialogButton from './dialog-button';
import EndpointForm from './endpoint-management-form';

interface EndpointsListProps {
}

export default function EndpointsList() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const fetchEndpoints = async () => {
    try {
      const response = await fetch('/api/endpoints');
      const data = await response.json();
      setEndpoints(data);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Available Endpoints</h2>
      {endpoints.map((endpoint) => (
        <Card key={endpoint.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="px-2 py-1 rounded text-sm">
                  {endpoint.method}
                </span>
                <span>{endpoint.name}</span>
              </div>
              <DialogButton
                variant="outline"
                size="icon"
                content={
                  <EndpointForm
                    endpoint={endpoint}
                    onCancel={() => fetchEndpoints()}
                  />
                }
              >
                <Pencil className="h-4 w-4" />
              </DialogButton>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{endpoint.description}</p>
            <p className="font-mono p-2 rounded">
              {endpoint.path}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}