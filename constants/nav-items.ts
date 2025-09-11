import {
  FileJson2,
  Home,
  Table2,
  FolderOpen,
  Globe,
  Database,
  LucideProps,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
}

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
  // {
  //   to: "schemas",
  //   label: "Schemas",
  //   icon: Table2,
  // },
  // {
  //   to: "response-wrapper",
  //   label: "Response Wrappers",
  //   icon: FileJson2,
  // },
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
