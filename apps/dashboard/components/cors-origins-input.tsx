"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CorsOriginsInputProps {
  value: string[];
  onChange: (origins: string[]) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const CorsOriginsInput = React.forwardRef<HTMLDivElement, CorsOriginsInputProps>(
  ({ className, value = [], onChange, placeholder = "http://localhost:3000", disabled }, ref) => {
    const addOrigin = () => {
      onChange([...value, ""]);
    };

    const updateOrigin = (index: number, newValue: string) => {
      const newOrigins = [...value];
      newOrigins[index] = newValue;
      onChange(newOrigins);
    };

    const removeOrigin = (index: number) => {
      const newOrigins = value.filter((_, i) => i !== index);
      onChange(newOrigins);
    };

    return (
      <div ref={ref} className={cn("flex flex-col gap-2 w-full", className)}>
        {value.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No CORS origins configured. Add origins to allow cross-origin requests.
          </div>
        )}
        
        {value.map((origin, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              value={origin}
              onChange={(e) => updateOrigin(index, e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeOrigin(index)}
              disabled={disabled}
              className="shrink-0"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addOrigin}
          disabled={disabled}
          className="w-full"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add CORS Origin
        </Button>
      </div>
    );
  }
);

CorsOriginsInput.displayName = "CorsOriginsInput";

export { CorsOriginsInput };
