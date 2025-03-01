'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Endpoint } from '@prisma/client';
import DialogButton from './dialog-button';
import EndpointForm from './endpoint-management-form';

export default function EndpointsList() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const fetchEndpoints = async () => {
    try {
      const response = await fetch('/api/endpoints');
      const data = await response.json();
      if (data.error) {
        console.error('Error fetching endpoints:', data.error);
        return;
      }
      setEndpoints(data);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    }
  };

  const deleteEndpoint = async (id: string) => {
    try {
      const response = await fetch(`/api/endpoints/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.error) {
        console.error('Error deleting endpoint:', data.error);
        return;
      }
    } catch (error) {
      console.error('Error deleting endpoint:', error);
    }
  }

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
              <div className='flex gap-2'>
                <DialogButton
                  variant="outline"
                  size="icon"
                  content={
                    <EndpointForm
                      endpoint={endpoint}
                    />
                  }
                >
                  <Pencil className="size-4" />
                </DialogButton>
                <DialogButton
                  variant="outline"
                  size="icon"
                  content={
                    <div>
                      <h2 className="text-xl font-bold">Are you sure?</h2>
                      <p>This action cannot be undone.</p>
                      <div className="flex justify-end gap-4">
                        <Button
                          variant="destructive"
                          onClick={() => deleteEndpoint(endpoint.id)}
                        >Delete</Button>
                        <Button variant="outline">Cancel</Button>
                      </div>
                    </div>
                  }
                >
                  <Trash className="size-4" />
                </DialogButton>
              </div>
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