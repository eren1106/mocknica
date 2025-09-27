"use client";

import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface DialogButtonProps {
  children: ReactNode;
  content: ReactNode | ((close: () => void) => ReactNode);
  title?: string;
  description?: string;
  className?: string;
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "default" | "sm" | "lg" | "icon" | "rounded";
  contentClassName?: string;
  disabled?: boolean;
}

const DialogButton = ({
  children,
  content,
  title,
  description,
  className,
  variant = "default",
  open,
  onOpenChange,
  size,
  contentClassName,
  disabled = false,
}: DialogButtonProps) => {
  const [isOpen, setIsOpen] = useState(open || false);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const close = () => handleOpenChange(false);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          className={className}
          size={size}
          disabled={disabled}
        >
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("w-full md:w-auto max-w-[90vw] lg:min-w-[50vw] md:min-w-[60vw] min-w-full p-0", contentClassName)}>
        {/* the dialog content need dialog title component no matter what */}
        {!title && <DialogTitle className="hidden"/>}

        <ScrollArea className="max-h-[90vh] p-6">
          {(title || description) && (
            <DialogHeader className="mb-5">
               {title && <DialogTitle>{title}</DialogTitle>}
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
          )}
          {typeof content === "function" ? content(close) : content}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DialogButton;
