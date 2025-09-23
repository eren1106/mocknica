import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
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
  const noNeedConvertList = ["ID","UUID"];
  if (noNeedConvertList.includes(input)) return input;

  return input
      .toLowerCase()                 // Convert the string to lowercase
      .split('_')                    // Split by underscores
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(' ');                    // Join the words with a space
}

export function removeUndefinedFields (obj: any) {
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

export function generateApiToken(): string {
  // Generate a secure random token for API access
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export function stringifyJSON (jsonData: any, space: number = 2): string {
  try {
    return JSON.stringify(jsonData, undefined, space);
  } catch (error) {
    console.error("Error stringifying JSON:", error);
    return String(jsonData);
  }
};

export function formatDate (date: Date | string): string {
  return new Date(date).toLocaleDateString();
};

/**
 * Copies text to clipboard with error handling and toast feedback
 * @param text - The text to copy
 * @param successMessage - Success message for toast (optional)
 * @param errorMessage - Error message for toast (optional)
 */
export const copyToClipboard = async (
  text: string,
  successMessage = "Copied to clipboard!",
  errorMessage = "Failed to copy to clipboard"
): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch (error) {
    console.error("Failed to copy text:", error);
    toast.error(errorMessage);
  }
};

/**
 * Formats an API endpoint URL for display
 * @param projectId - The project ID
 * @param baseUrl - The base URL (defaults to NEXT_PUBLIC_APP_URL)
 * @returns The formatted API endpoint URL
 */
export const formatProjectEndpointBaseURL = (
  projectId: string,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL
): string => {
  return `${baseUrl}/api/mock/${projectId}/`;
};
