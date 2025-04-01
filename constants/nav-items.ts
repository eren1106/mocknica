import { Home, Table2 } from "lucide-react";

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
      to: "schema",
      label: "Schema",
      icon: Table2,
    },
  ]