'use client'

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  path: z.string().min(1, "Path is required"),
  parameters: z.string().optional(),
  requestBody: z.string().optional(),
  response: z.string().min(1, "Response schema is required"),
  responseGen: z.enum(["STATIC", "LLM"]),
  staticResponse: z.string().optional(),
  arrayQuantity: z.number().optional(),
});

export default function EndpointForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      method: "GET",
      path: "",
      parameters: "",
      requestBody: "",
      response: "",
      responseGen: "STATIC",
      staticResponse: "",
      arrayQuantity: 0,
    },
  });
  

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('/api/endpoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) throw new Error('Failed to create endpoint');
      
      // Reset form and show success message
      form.reset();
    } catch (error) {
      console.error('Error creating endpoint:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Mock API Endpoint</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Users API" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="API endpoint description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["GET", "POST", "PUT", "DELETE", "PATCH"].map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="path"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Path</FormLabel>
                    <FormControl>
                      <Input placeholder="/api/users" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="parameters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Query Parameters (JSON)</FormLabel>
                  <FormControl>
                    <Textarea placeholder='{"page": "number", "limit": "number"}' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requestBody"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Body Schema (TypeScript)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="interface RequestBody { name: string; age: number; }" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="response"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Schema (TypeScript)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="interface Response { id: number; name: string; }" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responseGen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Generation</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select response type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STATIC">Static Response</SelectItem>
                      <SelectItem value="LLM">LLM Generated</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("responseGen") === "STATIC" && (
              <FormField
                control={form.control}
                name="staticResponse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Static Response (JSON)</FormLabel>
                    <FormControl>
                      <Textarea placeholder='{"id": 1, "name": "John Doe"}' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="arrayQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Array Quantity (if response is an array)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Create Endpoint</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}