'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ResponseWrapper } from '@/models/response-wrapper.model';
import { ResponseWrapperService } from '@/services/response-wrapper.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  json: z.string().min(1, 'JSON is required').refine(
    (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'Invalid JSON format',
    }
  ),
});

const WrappersPage = () => {
  const [wrappers, setWrappers] = useState<ResponseWrapper[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingWrapper, setEditingWrapper] = useState<ResponseWrapper | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      json: '',
    },
  });

  const loadWrappers = async () => {
    try {
      const data = await ResponseWrapperService.getAllResponseWrappers();
      setWrappers(data);
    } catch (error) {
      toast.error('Failed to load response wrappers');
    }
  };

  useEffect(() => {
    loadWrappers();
  }, []);

  useEffect(() => {
    if (editingWrapper) {
      form.reset({
        name: editingWrapper.name,
        json: JSON.stringify(editingWrapper.json, null, 2),
      });
    } else {
      form.reset({
        name: '',
        json: '',
      });
    }
  }, [editingWrapper, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const parsedJson = JSON.parse(values.json);
      if (editingWrapper) {
        await ResponseWrapperService.updateResponseWrapper(editingWrapper.id, {
          name: values.name,
          json: parsedJson,
        });
        toast.success('Response wrapper updated successfully');
      } else {
        await ResponseWrapperService.createResponseWrapper({
          name: values.name,
          json: parsedJson,
        });
        toast.success('Response wrapper created successfully');
      }
      setIsOpen(false);
      loadWrappers();
    } catch (error) {
      toast.error('Failed to save response wrapper');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ResponseWrapperService.deleteResponseWrapper(id);
      toast.success('Response wrapper deleted successfully');
      loadWrappers();
    } catch (error) {
      toast.error('Failed to delete response wrapper');
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Response Wrappers</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingWrapper(null);
                setIsOpen(true);
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Wrapper
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingWrapper ? 'Edit Wrapper' : 'Add Wrapper'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="json"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>JSON</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="font-mono"
                          rows={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">
                    {editingWrapper ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wrappers.map((wrapper) => (
          <Card key={wrapper.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{wrapper.name}</span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingWrapper(wrapper);
                      setIsOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(wrapper.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-48">
                {JSON.stringify(wrapper.json, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WrappersPage;