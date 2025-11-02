import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import React from "react";

interface IMyTooltip {
  children: React.ReactNode;
  content: React.ReactNode;
  delayDuration?: number;
  asChild?: boolean;
  className?: string;
}

export default function MyTooltip({ children, content, delayDuration = 0, asChild = false, className }: IMyTooltip) {
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
      <TooltipContent className={className}>{content}</TooltipContent>
    </Tooltip>
  );
}
