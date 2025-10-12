import { useForm, UseFormReturn, DefaultValues, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export const useZodForm = <T extends FieldValues>(schema: z.ZodType<T>, defaultValues: Partial<T> = {}): UseFormReturn<T> => {
  return useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>, // Casting to ensure compatibility
  });
};
