import {
  FileJson2,
  Home,
  FolderOpen,
  Globe,
  Database,
} from "lucide-react";
import { NavItem } from "@/types/navigation";

export const NAV_ITEMS: NavItem[] = [
  {
    to: "",
    label: "Home",
    icon: Home,
  },
  {
    to: "projects",
    label: "Projects",
    icon: FolderOpen,
  },
];

export const PROJECT_NAV_ITEMS: NavItem[] = [
  {
    to: "",
    label: "Overview",
    icon: Home,
  },
  {
    to: "endpoints",
    label: "Endpoints",
    icon: Globe,
  },
  {
    to: "schemas",
    label: "Schemas",
    icon: Database,
  },
  {
    to: "response-wrappers",
    label: "Response Wrappers",
    icon: FileJson2,
  },
];
