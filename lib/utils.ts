import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertCamelCaseToTitle(input: string): string  {
  // Split the string at each uppercase letter
  const words = input.replace(/([A-Z])/g, ' $1').trim();

  // Capitalize the first letter of the first word
  const result = words.charAt(0).toUpperCase() + words.slice(1);

  return result;
}

export function getZodFieldNames <T extends z.ZodObject<any>>(schema: T | z.ZodEffects<T>) {
  // If schema is a ZodEffects, extract the inner schema
  const actualSchema = schema instanceof z.ZodEffects ? schema._def.schema : schema;

  const shape = actualSchema.shape;

  // Create an object that maps field names directly
  return Object.keys(shape).reduce((acc, key) => {
    acc[key as keyof T['shape']] = key; // Assign the field name directly
    return acc;
  }, {} as { [K in keyof T['shape']]: string });
};

export function convertFirstLetterToUpperCase(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

export function convertEnumToTitleCase(input: string): string {
  return input
      .toLowerCase()                 // Convert the string to lowercase
      .split('_')                    // Split by underscores
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(' ');                    // Join the words with a space
}

export function removeUndefinedFields (obj: any): any {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, value]) => value !== undefined)
  );
};

// Helper function to format JSON with proper indentation
export function formatJSON (jsonData: any): string {
  try {
    return JSON.stringify(jsonData, null, 2);
  } catch (error) {
    return String(jsonData);
  }
};

export function generateUUID (): string {
  return crypto.randomUUID();
};
