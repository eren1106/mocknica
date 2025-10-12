"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";

const SidebarSheet = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="block md:hidden hover:bg-secondary/80 transition-colors"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      {/* Screen reader accessible title */}
      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
      <SheetContent 
        side="left" 
        className="p-0 w-[85vw] md:w-[--sidebar-width]"
      >
        <div className="h-full overflow-y-auto">
          <Sidebar onNavItemClicked={() => setIsOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarSheet;
