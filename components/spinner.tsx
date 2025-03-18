import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  className?: string;
}

const Spinner = ({ className }: SpinnerProps) => {
  return (
    <Loader2 className={cn("mr-2 size-10 animate-spin text-primary", className)} />
  )
}

export default Spinner