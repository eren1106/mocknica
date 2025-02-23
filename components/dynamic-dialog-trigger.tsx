import { ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

interface DynamicDialogTriggerProps {
  children?: ReactNode;
  content: ReactNode;
  title?: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
  hasClose?: boolean;
  closeClassName?: string;
}

const DynamicDialogTrigger = ({
  children,
  content,
  title,
  description,
  open,
  onOpenChange,
  contentClassName,
  hasClose = true,
  closeClassName,
}: DynamicDialogTriggerProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {
        children && (
          <DialogTrigger asChild>
            <div>
              {children}
            </div>
          </DialogTrigger>
        )
      }
      <DialogContent
        className={cn("p-0", contentClassName)}
        hasClose={hasClose}
        closeClassName={closeClassName}
      >
        <ScrollArea className='max-h-[90vh] p-6'>
          {
            (title || description) && (
              <DialogHeader>
                {title && <DialogTitle className='mb-3'>{title}</DialogTitle>}
                {
                  description && (
                    <DialogDescription>
                      {description}
                    </DialogDescription>
                  )
                }
              </DialogHeader>
            )
          }
          {content}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default DynamicDialogTrigger