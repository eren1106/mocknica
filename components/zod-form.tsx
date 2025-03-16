import React from 'react';
import { Form } from '@/components/ui/form';
import { SubmitHandler, UseFormReturn, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface ZodFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  className?: string;
}

const ZodForm = <T extends FieldValues>({ form, onSubmit, children, className }: ZodFormProps<T>) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("flex flex-col gap-5", className)}>
        {children}
      </form>
    </Form>
  );
};

export default ZodForm;
