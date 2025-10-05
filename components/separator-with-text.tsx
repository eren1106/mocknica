import React, { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils';

interface SeparatorWithTextProp{
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

const SeparatorWithText = ({
  children,
  className,
  containerClassName,
}: SeparatorWithTextProp) => {
  return (
    <div className={cn('flex items-center gap-3', containerClassName)}>
      <Separator className={cn('flex-1', className)} />
      {children}
      <Separator className={cn('flex-1', className)} />
    </div>
  )
}

export default SeparatorWithText