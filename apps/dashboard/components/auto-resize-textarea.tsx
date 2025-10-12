import ResizeTextarea, { TextareaAutosizeProps } from "react-textarea-autosize";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface AutoResizeTextareaProps extends TextareaAutosizeProps {
  maxChar?: number;
}

const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ className, maxChar, ...props }, ref) => {
  const [charCount, setCharCount] = useState(0);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!maxChar) return;
    const value = event.target.value;
    if (value.length <= maxChar) {
      setCharCount(value.length);
      props.onChange?.(event);
    } else {
      const trimmedText = value.slice(0, maxChar);
      event.target.value = trimmedText;
      setCharCount(maxChar);
    }
  };

  return (
    <div className="relative w-full">
      <ResizeTextarea
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        ref={ref}
        onChange={handleInputChange}
        {...props}
      />
      {maxChar && (
        <div className="absolute bottom-1 right-3 text-xs text-muted-foreground">
          {charCount}/{maxChar} characters
        </div>
      )}
    </div>
  );
});

// Set the display name for the forwardRef component
AutoResizeTextarea.displayName = "AutoResizeTextarea";

export default AutoResizeTextarea;
