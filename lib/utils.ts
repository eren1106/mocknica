import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
