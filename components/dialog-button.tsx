import { ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from './ui/scroll-area';

interface DialogButtonProps {
  children: ReactNode;
  content: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost";
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className} size={size} disabled={disabled}>{children}</Button>
      </DialogTrigger>
      <DialogContent className={cn("p-0", contentClassName)}>
        <ScrollArea className='max-h-[90vh] p-6'>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          {content}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default DialogButton