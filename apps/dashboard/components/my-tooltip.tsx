import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import React from "react";

interface IMyTooltip {
  children: React.ReactNode;
  content: React.ReactNode;
  delayDuration?: number;
}

export default function MyTooltip({ children, content, delayDuration = 0 }: IMyTooltip) {
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild={false}>{children}</TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
}
