import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

const Spinner = ({ className }: SpinnerProps) => {
  return (
    <div className={cn("animate-spin rounded-full h-8 w-8 border-b-2 border-primary", className)}></div>
  )
}

export default Spinner