import { FileJson2, Home, Table2 } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType;
}

export const NAV_ITEMS: NavItem[] = [
    {
      to: "",
      label: "Home",
      icon: Home
    },
    {
      to: "schemas",
      label: "Schemas",
      icon: Table2,
    },
    {
      to: "wrappers",
      label: "Wrappers",
      icon: FileJson2,
    },
  ]